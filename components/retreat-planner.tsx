"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { CalendarIcon, Copy, Plus, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { openDB } from "idb" // Import IndexedDB wrapper
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from "chart.js"
import { Bar } from "react-chartjs-2"

import { Employee, TripParams, SearchResult } from "@/components/types"
import AdvancedFiltersPopover from "./improved-filters-popover"

// Register chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend)

const dbName = "RetreatPlannerDB"
const storeName = "RetreatPlannerStore"

const cabinOptions = [
  { value: "ECONOMY", label: "Economy" },
  { value: "PREMIUM", label: "Premium Economy" },
  { value: "BUSINESS", label: "Business" },
  { value: "FIRST", label: "First" },
]

const stopOptions = [
  { value: "ANY-STOPS", label: "Any stops" },
  { value: "NON-STOP", label: "Non-stop" },
  { value: "ONE-OR-FEWER-STOPS", label: "One or fewer stops" },
  { value: "TWO-OR-FEWER-STOPS", label: "Two or fewer stops" },
]

const layoverOptions = [
  { label: "1", value: 60 },
  { label: "2", value: 120 },
  { label: "3", value: 180 },
  { label: "4", value: 240 },
  { label: "5", value: 300 },
  { label: "6", value: 360 },
  { label: "10", value: 600 },
  { label: "Any", value: 1800 },
]

// A small palette to cycle through for each unique destination
const barColors = [
  "#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF", "#FF9F40", "#8B0000", "#008000", "#00008B", "#FFD700",
  "#FFA07A", "#20B2AA", "#778899", "#D2691E", "#FF4500", "#00FF7F", "#4682B4", "#C71585", "#708090", "#FF1493"
]

const usAirports = ["JFK", "LAX", "ORD", "ATL", "DFW", "DEN", "SFO", "SEA", "MIA", "BOS"];
const caAirports = ["YYZ", "YVR", "YUL", "YYC"];
const euAirports = ["LHR", "CDG"];
const cabinClasses = ["ECONOMY", "ECONOMY", "ECONOMY", "ECONOMY", "ECONOMY", "ECONOMY", "ECONOMY", "BUSINESS", "BUSINESS"];

const generateEmployees = () => {
  let employees = [];
  for (let i = 1; i <= 40; i++) {
    let origin;
    if (i <= 32) {
      // 80% from the USA
      origin = usAirports[i % usAirports.length];
    } else if (i <= 38) {
      // 15% from Canada
      origin = caAirports[i % caAirports.length];
    } else {
      // 5% from Europe
      origin = euAirports[i % euAirports.length];
    }

    employees.push({
      id: `emp${i}`,
      employeeName: `Employee ${i}`,
      origin,
      cabin: cabinClasses[Math.floor(Math.random() * cabinClasses.length)],
      filters: {
        numStops: "ANY-STOPS",
        maxLayover: 600,
        departHourStart: 0,
        departHourEnd: 23,
        arrivalHourStart: 1,
        arrivalHourEnd: 23,
        passengerType: { adults: 1, children: 0, infantInSeat: 0, infantOnLap: 0 },
        currency: "USD",
        language: "en-US",
        showSeparateTickets: false,
        flightDuration: 3000,
        excludedAirlines: [],
        excludedAirports: [],
        onlyAirlines: [],
        onlyAirports: [],
        minLayover: 0,
        totalCarryOnBags: 0,
        totalCheckedBags: 0,
        emissions: false,
        requestLocation: "US",
        avoidUSConnections: false,
      },
    });
  }
  return employees;
};
async function getDB() {
  return openDB(dbName, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName)
      }
    },
  })
}
async function saveToDB(key: string, data: any) {
  const db = await getDB()
  return db.put(storeName, data, key)
}
async function loadFromDB(key: string) {
  const db = await getDB()
  return db.get(storeName, key)
}
export default function RetreatPlanner() {
  const [tripParams, setTripParams] = useState<TripParams>({
    startDate: new Date("2025-07-01"),
    returnDate: new Date("2025-07-31"),
    destinations: ["CUN", "MEX", "NAS", "PTY", "SJD", "AUA", "BJI", "SJU", "STT", "SXM", "STX"],
    minTripLength: 4,
    maxTripLength: 5,
    tripType: "ROUND-TRIP",
  })

  const [employees, setEmployees] = useState<Employee[]>(generateEmployees());

  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Load from localStorage
  useEffect(() => {
    ;(async () => {
      const saved: any = await loadFromDB("plannerData")
      if (saved) {
        if (saved.tripParams?.startDate) {
          saved.tripParams.startDate = new Date(saved.tripParams.startDate)
        }
        if (saved.tripParams?.returnDate) {
          saved.tripParams.returnDate = new Date(saved.tripParams.returnDate)
        }
        setTripParams(saved.tripParams ?? tripParams)
        setEmployees(saved.employees ?? [])
        setSearchResults(saved.searchResults ?? [])
        setHasSearched(saved.hasSearched ?? false)
      }
    })()
  }, [])

  // Save to IndexedDB
  useEffect(() => {
    const data = { employees, searchResults, hasSearched, tripParams }
    saveToDB("plannerData", data)
  }, [employees, searchResults, hasSearched, tripParams])

  const formatCurrency = (amount: number) =>
      new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)

  // Add/Remove employees
  const addEmployee = () => {
    setEmployees((prev) => [
      ...prev,
      {
        id: `emp${prev.length + 1}`,
        employeeName: "",
        origin: "JFK",
        cabin: "ECONOMY",
        filters: {
          numStops: "ANY-STOPS",
          maxLayover: 600,
          departHourStart: 1,
          departHourEnd: 23,
          arrivalHourStart: 1,
          arrivalHourEnd: 23,
          passengerType: { adults: 1, children: 0, infantInSeat: 0, infantOnLap: 0 },
          currency: "USD",
          language: "en-US",
          showSeparateTickets: false,
          flightDuration: 3000,
          excludedAirlines: [],
          excludedAirports: [],
          onlyAirlines: [],
          onlyAirports: [],
          minLayover: 0,
          totalCarryOnBags: 0,
          totalCheckedBags: 0,
          emissions: false,
          requestLocation: "US",
          avoidUSConnections: false,
        },
      },
    ])
  }

  const duplicateEmployee = (employee: Employee) => {
    const clone = { ...JSON.parse(JSON.stringify(employee)) }
    clone.id = `emp${employees.length + 1}`
    setEmployees([...employees, clone])
  }

  const removeEmployee = (id: string) => {
    setEmployees(employees.filter((e) => e.id !== id))
  }

  const updateEmployee = (updated: Employee) => {
    setEmployees(employees.map((e) => (e.id === updated.id ? updated : e)))
  }

  // Destinations
  const [destinationInput, setDestinationInput] = useState("")
  const addDestination = () => {
    const code = destinationInput.trim().toUpperCase()
    if (
        /^[A-Z]{3}$/.test(code) &&
        !tripParams.destinations.includes(code) &&
        tripParams.destinations.length < 20
    ) {
      setTripParams({
        ...tripParams,
        destinations: [...tripParams.destinations, code],
      })
      setDestinationInput("")
    }
  }

  const removeDestination = (dest: string) => {
    setTripParams({
      ...tripParams,
      destinations: tripParams.destinations.filter((d) => d !== dest),
    })
  }

  // Perform search
  const handleSearch = async () => {
    if (!tripParams.startDate || !tripParams.returnDate) return
    setIsLoading(true)

    const formatDate = (d: Date) => d.toISOString().split("T")[0]

    const employeeRequests = employees.map((emp) => ({
      origins: [emp.origin],
      cabin: emp.cabin,
      numStops: emp.filters.numStops,
      maxLayover: emp.filters.maxLayover,
      departHourStart: emp.filters.departHourStart,
      departHourEnd: emp.filters.departHourEnd,
      arrivalHourStart: emp.filters.arrivalHourStart,
      arrivalHourEnd: emp.filters.arrivalHourEnd,
      passengerType: emp.filters.passengerType,
      currency: emp.filters.currency,
      language: emp.filters.language,
      showSeparateTickets: emp.filters.showSeparateTickets,
      flightDuration: emp.filters.flightDuration,
      excludedAirlines: emp.filters.excludedAirlines,
      excludedAirports: emp.filters.excludedAirports,
      onlyAirlines: emp.filters.onlyAirlines,
      onlyAirports: emp.filters.onlyAirports,
      minLayover: 0,
      totalCarryOnBags: emp.filters.totalCarryOnBags,
      totalCheckedBags: emp.filters.totalCheckedBags,
      emissions: emp.filters.emissions,
      requestLocation: emp.filters.requestLocation,
      avoidUSConnections: emp.filters.avoidUSConnections,
    }))

    const requestData = {
      startDate: formatDate(tripParams.startDate),
      returnDate: formatDate(tripParams.returnDate),
      destinations: tripParams.destinations,
      minTripLength: tripParams.minTripLength,
      maxTripLength: tripParams.maxTripLength,
      tripType: tripParams.tripType,
      employees: employeeRequests,
    }

    try {
      // Example fetch
      const response = await fetch("https://ret.flyfast.io/analyzeCosts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      })
      if (!response.ok) throw new Error("Network Error")

      const data = await response.json()
      setSearchResults(data)
      setSelectedResult(null)
      setHasSearched(true)
    } catch (error) {
      console.error("Error fetching data:", error)
      // Fallback example
      setSearchResults([
        {
          startDate: "2025-06-15",
          returnDate: "2025-06-20",
          destination: "CUN",
          totalCost: 3250.75,
          offers: [
            { origin: "JFK", cabin: "ECONOMY", price: 850.25, url: "https://example.com/book/jfk-cun" },
            { origin: "LAX", cabin: "BUSINESS", price: 1200.5, url: "https://example.com/book/lax-cun" },
          ],
        },
      ])
      setSelectedResult(null)
      setHasSearched(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResultSelect = async (res: SearchResult) => {
    await saveToDB("selectedTrip", res)
    const tripId = `${res.destination}-${res.startDate}-${res.returnDate}`.replace(/[^a-zA-Z0-9]/g, "-")
    window.location.href = `/trip/${tripId}`
  }

  // Build a color map for each unique destination
  const uniqueDests = Array.from(new Set(searchResults.map((r) => r.destination)))
  const destinationColorMap: Record<string, string> = {}
  let colorIndex = 0
  for (const d of uniqueDests) {
    destinationColorMap[d] = barColors[colorIndex % barColors.length]
    colorIndex++
  }

  return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Trip Parameters</CardTitle>
            <CardDescription>Set your travel dates, trip length, etc.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Date range + Trip length */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date Range */}
              <div className="space-y-2">
                <Label htmlFor="date-range">Date Range</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                          id="date-range"
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {tripParams.startDate
                            ? format(tripParams.startDate, "PPP")
                            : "Start Date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                          mode="single"
                          selected={tripParams.startDate}
                          onSelect={(date) =>
                              setTripParams({
                                ...tripParams,
                                startDate: date ?? undefined,
                                returnDate:
                                    tripParams.returnDate && date && tripParams.returnDate < date
                                        ? undefined
                                        : tripParams.returnDate,
                              })
                          }
                          disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                          disabled={!tripParams.startDate}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {tripParams.returnDate
                            ? format(tripParams.returnDate, "PPP")
                            : "Return Date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                          mode="single"
                          selected={tripParams.returnDate}
                          onSelect={(date) =>
                              setTripParams({ ...tripParams, returnDate: date ?? undefined })
                          }
                          disabled={(date) =>
                              !tripParams.startDate || (date && date < tripParams.startDate)
                          }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Trip Length */}
              <div className="space-y-2">
                <Label>Trip Length (nights)</Label>
                <div className="flex gap-2">
                  <Select
                      value={tripParams.minTripLength.toString()}
                      onValueChange={(value) => {
                        const val = Number(value)
                        setTripParams({
                          ...tripParams,
                          minTripLength: val,
                          maxTripLength: Math.max(val, tripParams.maxTripLength),
                        })
                      }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Min" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 30 }, (_, i) => i + 1).map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                      value={tripParams.maxTripLength.toString()}
                      onValueChange={(value) =>
                          setTripParams({ ...tripParams, maxTripLength: Number(value) })
                      }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Max" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 30 }, (_, i) => i + 1)
                          .filter((num) => num >= tripParams.minTripLength)
                          .map((num) => (
                              <SelectItem key={num} value={num.toString()}>
                                {num}
                              </SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Destinations */}
            <div className="space-y-2">
              <Label>Potential Destinations (IATA)</Label>
              <div className="flex gap-2">
                <Input
                    value={destinationInput}
                    onChange={(e) => setDestinationInput(e.target.value.toUpperCase().slice(0, 3))}
                    placeholder="Enter 3-letter code"
                    className="uppercase"
                    maxLength={3}
                />
                <Button
                    onClick={addDestination}
                    disabled={
                        !/^[A-Z]{3}$/.test(destinationInput) ||
                        tripParams.destinations.includes(destinationInput) ||
                        tripParams.destinations.length >= 20
                    }
                >
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {tripParams.destinations.map((dest) => (
                    <Badge key={dest} variant="default" className="cursor-pointer">
                      {dest}
                      <X
                          className="ml-1 h-3 w-3"
                          onClick={() => removeDestination(dest)}
                      />
                    </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {tripParams.destinations.length}/20 destinations
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Employees */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Employees</CardTitle>
              <CardDescription>List of employees and travel preferences</CardDescription>
            </div>
            <Button onClick={addEmployee} size="sm">
              <Plus className="mr-1 h-4 w-4" /> Add Employee
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table className="text-center">
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Origin</TableHead>
                    <TableHead>Cabin</TableHead>
                    <TableHead>Stops</TableHead>
                    <TableHead>Max Layover (hrs)</TableHead>
                    <TableHead>Arrival Window</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((emp, idx) => (
                      <TableRow key={emp.id}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>
                          <Input
                              value={emp.employeeName}
                              onChange={(e) => updateEmployee({ ...emp, employeeName: e.target.value })}
                              className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                              value={emp.origin}
                              onChange={(e) => {
                                const originVal = e.target.value.toUpperCase().slice(0, 3)
                                updateEmployee({ ...emp, origin: originVal })
                              }}
                              className="h-8 uppercase font-mono"
                              maxLength={3}
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                              value={emp.cabin}
                              onValueChange={(val) => updateEmployee({ ...emp, cabin: val })}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Cabin" />
                            </SelectTrigger>
                            <SelectContent>
                              {cabinOptions.map((c) => (
                                  <SelectItem key={c.value} value={c.value}>
                                    {c.label}
                                  </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                              value={emp.filters.numStops}
                              onValueChange={(val) =>
                                  updateEmployee({ ...emp, filters: { ...emp.filters, numStops: val } })
                              }
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Stops" />
                            </SelectTrigger>
                            <SelectContent>
                              {stopOptions.map((s) => (
                                  <SelectItem key={s.value} value={s.value}>
                                    {s.label}
                                  </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                              value={emp.filters.maxLayover.toString()}
                              onValueChange={(val) =>
                                  updateEmployee({
                                    ...emp,
                                    filters: {
                                      ...emp.filters,
                                      maxLayover: Number(val),
                                    },
                                  })
                              }
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Max Layover" />
                            </SelectTrigger>
                            <SelectContent>
                              {layoverOptions.map((lo) => (
                                  <SelectItem key={lo.value} value={lo.value.toString()}>
                                    {lo.label}
                                  </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label className="text-xs">Start</Label>
                              <Input
                                  type="number"
                                  min={0}
                                  max={23}
                                  value={emp.filters.arrivalHourStart}
                                  onChange={(e) => {
                                    const val = Math.max(0, Math.min(23, Number(e.target.value) || 0))
                                    updateEmployee({ ...emp, filters: { ...emp.filters, arrivalHourStart: val } })
                                  }}
                                  className="h-8"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">End</Label>
                              <Input
                                  type="number"
                                  min={0}
                                  max={23}
                                  value={emp.filters.arrivalHourEnd}
                                  onChange={(e) => {
                                    const val = Math.max(0, Math.min(23, Number(e.target.value) || 0))
                                    updateEmployee({ ...emp, filters: { ...emp.filters, arrivalHourEnd: val } })
                                  }}
                                  className="h-8"
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1 justify-center">
                            <AdvancedFiltersPopover employee={emp} onUpdate={updateEmployee} />
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => duplicateEmployee(emp)}
                                title="Duplicate"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => removeEmployee(emp.id)}
                                title="Remove"
                            >
                              <X className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
          <CardFooter>
            <Button
                className="w-full"
                size="lg"
                onClick={handleSearch}
                disabled={
                    isLoading ||
                    !tripParams.startDate ||
                    !tripParams.returnDate ||
                    tripParams.destinations.length === 0 ||
                    employees.length === 0
                }
            >
              {isLoading ? "Searching..." : "Search for Retreats"}
              {!isLoading && <Search className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        </Card>

        {/* Results */}
        {hasSearched && (
            <Tabs defaultValue="chart">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="results">Cost Chart</TabsTrigger>
                <TabsTrigger value="chart">Search Results</TabsTrigger>
              </TabsList>

              {/* Chart Tab */}
              <TabsContent value="chart">
                <Card>
                  <CardHeader>
                    <CardTitle>Cost Comparison</CardTitle>
                    {/* Destination color key */}
                    <div className="flex flex-wrap gap-4 mt-2">
                      {uniqueDests.map((dest) => (
                          <div key={dest} className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: destinationColorMap[dest] }}
                            />
                            <span className="text-sm">{dest}</span>
                          </div>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Bar
                        data={{
                          labels: searchResults.map((r) => r.destination),
                          datasets: [
                            {
                              label: "Total Cost",
                              data: searchResults.map((r) => r.totalCost),
                              backgroundColor: searchResults.map(
                                  (r) => destinationColorMap[r.destination]
                              ),
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          onClick: (_evt, elements) => {
                            if (elements.length > 0) {
                              const index = elements[0].index
                              handleResultSelect(searchResults[index])
                            }
                          },
                          plugins: {
                            tooltip: {
                              callbacks: {
                                label: (context) => {
                                  const sr = searchResults[context.dataIndex]
                                  return [
                                    `Cost: ${formatCurrency(sr.totalCost)}`,
                                    `Dates: ${sr.startDate} - ${sr.returnDate}`,
                                  ]
                                },
                                title: (context) => {
                                  // Show destination in the tooltip header
                                  const sr = searchResults[context[0].dataIndex]
                                  return sr.destination
                                },
                              },
                            },
                          },
                        }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              {/* Search Results Tab */}
              <TabsContent value="results">
                <Card>
                  <CardHeader>
                    <CardTitle>Retreat Options</CardTitle>
                    <CardDescription>Sorted by total cost</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {searchResults.map((res, i) => {
                        const isSelected =
                            selectedResult?.destination === res.destination &&
                            selectedResult?.startDate === res.startDate &&
                            selectedResult?.returnDate === res.returnDate

                        const key = `${res.destination}-${res.startDate}-${res.returnDate}-${i}`
                        return (
                            <div
                                key={key}
                                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                                    isSelected ? "border-primary bg-primary/10" : "hover:bg-muted/50"
                                }`}
                                onClick={() => handleResultSelect(res)}
                            >
                              <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                                <div>
                                  <h3 className="font-medium">{res.destination}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {res.startDate} – {res.returnDate}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-bold">{formatCurrency(res.totalCost)}</p>
                                  <p className="text-sm text-muted-foreground">
                                    For {res.offers.length} employee{res.offers.length > 1 ? "s" : ""}
                                  </p>
                                </div>
                              </div>
                            </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
        )}
      </div>
  )
}