"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CalendarIcon, Copy, Plus, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import AdvancedFiltersPopover from "./advanced-filters-popover"

// Types
export type Employee = {
  id: string
  origin: string
  cabin: string
  filters: {
    numStops: string
    maxPrice: number
    maxLayover: number
    departHourStart: number
    departHourEnd: number
    arrivalHourStart: number
    arrivalHourEnd: number
    passengerType: {
      adults: number
      children: number
      infantInSeat: number
      infantOnLap: number
    }
    currency: string
    language: string
    showSeparateTickets: boolean
    flightDuration: number
    excludedAirlines: string[]
    excludedAirports: string[]
    onlyAirlines: string[]
    onlyAirports: string[]
    minLayover: number
    totalCarryOnBags: number
    totalCheckedBags: number
    emissions: boolean
    requestLocation: string
    avoidUSConnections: boolean
  }
}

// Update the TripParams type to match the API input format
export type TripParams = {
  startDate: Date | undefined
  returnDate: Date | undefined
  destinations: string[]
  minTripLength: number
  maxTripLength: number
  tripType: string
}

// Update the SearchResult type to match the API response format
type SearchResult = {
  startDate: string
  returnDate: string
  destination: string
  totalCost: number
  offers: EmployeeOffer[]
}

type EmployeeOffer = {
  origin: string
  cabin: string
  url: string
  price: number
}

// Data for cabin classes
const cabinOptions = [
  { value: "ECONOMY", label: "Economy" },
  { value: "PREMIUM", label: "Premium" },
  { value: "BUSINESS", label: "Business" },
  { value: "FIRST", label: "First" },
]

// Data for stop options
const stopOptions = [
  { value: "NON-STOP", label: "Non-stop" },
  { value: "ONE-OR-FEWER-STOPS", label: "One or fewer stops" },
  { value: "TWO-OR-FEWER-STOPS", label: "Two or fewer stops" },
  { value: "ANY-STOPS", label: "Any number of stops" },
]

export default function RetreatPlanner() {
  // Update the initial tripParams state to include tripType
  const [tripParams, setTripParams] = useState<TripParams>({
    startDate: undefined,
    returnDate: undefined,
    destinations: ["CUN", "MEX"],
    minTripLength: 5,
    maxTripLength: 7,
    tripType: "ROUND-TRIP",
  })

  // State for destination input
  const [destinationInput, setDestinationInput] = useState("")

  // State for employees
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: "emp1",
      origin: "JFK",
      cabin: "ECONOMY",
      filters: {
        numStops: "NON-STOP",
        maxPrice: 200000,
        maxLayover: 3000,
        departHourStart: 0,
        departHourEnd: 0,
        arrivalHourStart: 0,
        arrivalHourEnd: 0,
        passengerType: {
          adults: 1,
          children: 0,
          infantInSeat: 0,
          infantOnLap: 0,
        },
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
    {
      id: "emp2",
      origin: "LAX",
      cabin: "BUSINESS",
      filters: {
        numStops: "NON-STOP",
        maxPrice: 200000,
        maxLayover: 3000,
        departHourStart: 0,
        departHourEnd: 0,
        arrivalHourStart: 0,
        arrivalHourEnd: 0,
        passengerType: {
          adults: 1,
          children: 0,
          infantInSeat: 0,
          infantOnLap: 0,
        },
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

  // State for search results and selected result
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // Add a destination
  const addDestination = () => {
    // Validate IATA code (3 uppercase letters)
    const iataCode = destinationInput.trim().toUpperCase()
    if (
        /^[A-Z]{3}$/.test(iataCode) &&
        !tripParams.destinations.includes(iataCode) &&
        tripParams.destinations.length < 20
    ) {
      setTripParams({
        ...tripParams,
        destinations: [...tripParams.destinations, iataCode],
      })
      setDestinationInput("")
    }
  }

  // Remove a destination
  const removeDestination = (destination: string) => {
    setTripParams({
      ...tripParams,
      destinations: tripParams.destinations.filter((d) => d !== destination),
    })
  }

  // Add a new employee
  const addEmployee = () => {
    const newEmployee: Employee = {
      id: `emp${employees.length + 1}`,
      origin: "JFK",
      cabin: "ECONOMY",
      filters: {
        numStops: "NON-STOP",
        maxPrice: 100000,
        maxLayover: 3000,
        departHourStart: 0,
        departHourEnd: 23,
        arrivalHourStart: 8,
        arrivalHourEnd: 22,
        passengerType: {
          adults: 1,
          children: 0,
          infantInSeat: 0,
          infantOnLap: 0,
        },
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
    }
    setEmployees([...employees, newEmployee])
  }

  // Duplicate an employee
  const duplicateEmployee = (employee: Employee) => {
    const newEmployee = {
      ...JSON.parse(JSON.stringify(employee)),
      id: `emp${employees.length + 1}`,
    }
    setEmployees([...employees, newEmployee])
  }

  // Remove an employee
  const removeEmployee = (id: string) => {
    setEmployees(employees.filter((emp) => emp.id !== id))
  }

  // Update an employee
  const updateEmployee = (updatedEmployee: Employee) => {
    setEmployees(employees.map((emp) => (emp.id === updatedEmployee.id ? updatedEmployee : emp)))
  }

  // Handle search
  const handleSearch = async () => {
    if (!tripParams.startDate || !tripParams.returnDate) {
      return
    }

    setIsLoading(true)

    // Format dates as YYYY-MM-DD
    const formatDate = (date: Date) => {
      return date.toISOString().split("T")[0]
    }

    // Prepare employee data for API
    const employeeRequests = employees.map((emp) => ({
      origins: [emp.origin],
      cabin: emp.cabin,
      numStops: emp.filters.numStops,
      maxPrice: emp.filters.maxPrice,
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
      minLayover: emp.filters.minLayover,
      totalCarryOnBags: emp.filters.totalCarryOnBags,
      totalCheckedBags: emp.filters.totalCheckedBags,
      emissions: emp.filters.emissions,
      requestLocation: emp.filters.requestLocation,
      avoidUSConnections: emp.filters.avoidUSConnections,
    }))

    // Prepare the API request payload
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
      // Call the API
      const response = await fetch("http://localhost:8081/analyzeCosts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        throw new Error("Network response was not ok")
      }

      const data = await response.json()
      setSearchResults(data)
      setSelectedResult(null)
      setHasSearched(true)
    } catch (error) {
      console.error("Error fetching retreat options:", error)
      // Fallback to mock data for demo purposes
      setSearchResults([
        {
          startDate: "2025-06-15",
          returnDate: "2025-06-20",
          destination: "CUN",
          totalCost: 3250.75,
          offers: [
            {
              origin: "JFK",
              cabin: "ECONOMY",
              price: 850.25,
              url: "https://example.com/book/jfk-cun",
            },
            {
              origin: "LAX",
              cabin: "BUSINESS",
              price: 1200.5,
              url: "https://example.com/book/lax-cun",
            },
          ],
        },
        {
          startDate: "2025-06-18",
          returnDate: "2025-06-24",
          destination: "MEX",
          totalCost: 3750.25,
          offers: [
            {
              origin: "JFK",
              cabin: "ECONOMY",
              price: 920.75,
              url: "https://example.com/book/jfk-mex",
            },
            {
              origin: "LAX",
              cabin: "BUSINESS",
              price: 1350.5,
              url: "https://example.com/book/lax-mex",
            },
          ],
        },
      ])
      setSelectedResult(null)
      setHasSearched(true)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle result selection
  const handleResultSelect = (result: SearchResult) => {
    // Store the selected result in localStorage so the trip details page can access it
    localStorage.setItem("selectedTrip", JSON.stringify(result))

    // Navigate to the trip details page
    // Create a unique ID based on the trip details
    const tripId = `${result.destination}-${result.startDate}-${result.returnDate}`.replace(/[^a-zA-Z0-9]/g, "-")
    window.location.href = `/trip/${tripId}`
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  // Format time from hours (0-23) to display format
  const formatTime = (hours: number) => {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
  }

  // Get cabin name
  const getCabinName = (code: string) => {
    const cabin = cabinOptions.find((c) => c.value === code)
    return cabin ? cabin.label : code
  }

  // Get stop name
  const getStopName = (code: string) => {
    const stop = stopOptions.find((s) => s.value === code)
    return stop ? stop.label : code
  }

  return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Trip Parameters</CardTitle>
            <CardDescription>Set your preferred dates, destinations, and trip length</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date Range */}
              <div className="space-y-2">
                <Label htmlFor="date-range">Date Range</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button id="date-range" variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {tripParams.startDate ? format(tripParams.startDate, "PPP") : <span>Start Date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                          mode="single"
                          selected={tripParams.startDate}
                          onSelect={(date) => {
                            setTripParams({
                              ...tripParams,
                              startDate: date,
                              // Clear return date if it's before the new start date
                              returnDate:
                                  tripParams.returnDate && date && tripParams.returnDate < date
                                      ? undefined
                                      : tripParams.returnDate,
                            })
                          }}
                          initialFocus
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
                        {tripParams.returnDate ? format(tripParams.returnDate, "PPP") : <span>Return Date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                          mode="single"
                          selected={tripParams.returnDate}
                          onSelect={(date) => setTripParams({ ...tripParams, returnDate: date })}
                          initialFocus
                          disabled={(date) => !tripParams.startDate || date < tripParams.startDate}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Trip Length */}
              <div className="space-y-2">
                <Label>Trip Length (nights)</Label>
                <div className="flex gap-2">
                  <div className="w-full">
                    <Select
                        value={tripParams.minTripLength.toString()}
                        onValueChange={(value) => {
                          const minLength = Number.parseInt(value)
                          setTripParams({
                            ...tripParams,
                            minTripLength: minLength,
                            // Ensure maxTripLength is at least minTripLength
                            maxTripLength: Math.max(minLength, tripParams.maxTripLength),
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
                  </div>
                  <div className="w-full">
                    <Select
                        value={tripParams.maxTripLength.toString()}
                        onValueChange={(value) => {
                          const maxLength = Number.parseInt(value)
                          setTripParams({
                            ...tripParams,
                            maxTripLength: maxLength,
                          })
                        }}
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
            </div>

            {/* Destinations */}
            <div className="space-y-2">
              <Label>Potential Destinations (IATA Codes)</Label>
              <div className="flex gap-2">
                <Input
                    value={destinationInput}
                    onChange={(e) => setDestinationInput(e.target.value.toUpperCase().slice(0, 3))}
                    placeholder="Enter 3-letter IATA code"
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
                {tripParams.destinations.map((destination) => (
                    <Badge key={destination} variant="default" className="cursor-pointer">
                      {destination}
                      <X className="ml-1 h-3 w-3" onClick={() => removeDestination(destination)} />
                    </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{tripParams.destinations.length}/20 destinations added</p>
            </div>
          </CardContent>
        </Card>

        {/* Employees */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Employees</CardTitle>
              <CardDescription>Add employees and their travel preferences</CardDescription>
            </div>
            <Button onClick={addEmployee} size="sm">
              <Plus className="mr-1 h-4 w-4" /> Add Employee
            </Button>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">#</TableHead>
                    <TableHead className="w-[120px]">Origin</TableHead>
                    <TableHead className="w-[120px]">Cabin</TableHead>
                    <TableHead className="w-[120px]">Stops</TableHead>
                    <TableHead className="w-[120px]">Max Layover</TableHead>
                    <TableHead>Arrival Hours</TableHead>
                    <TableHead className="w-[120px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee, index) => (
                      <TableRow key={employee.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Input
                              value={employee.origin}
                              onChange={(e) => {
                                const origin = e.target.value.toUpperCase().slice(0, 3)
                                updateEmployee({
                                  ...employee,
                                  origin,
                                })
                              }}
                              className="h-8 uppercase"
                              maxLength={3}
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                              value={employee.cabin}
                              onValueChange={(cabin) => {
                                updateEmployee({
                                  ...employee,
                                  cabin,
                                })
                              }}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Cabin" />
                            </SelectTrigger>
                            <SelectContent>
                              {cabinOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                              value={employee.filters.numStops}
                              onValueChange={(numStops) => {
                                updateEmployee({
                                  ...employee,
                                  filters: {
                                    ...employee.filters,
                                    numStops,
                                  },
                                })
                              }}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Stops" />
                            </SelectTrigger>
                            <SelectContent>
                              {stopOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Select
                              value={employee.filters.maxLayover?.toString()}
                              onValueChange={(value) => {
                                updateEmployee({
                                  ...employee,
                                  filters: {
                                    ...employee.filters,
                                    maxLayover: Number.parseInt(value),
                                  },
                                })
                              }}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Max Layover" />
                            </SelectTrigger>
                            <SelectContent>
                              {[60, 120, 180, 240, 300, 360, 420, 480].map((mins) => (
                                  <SelectItem key={mins} value={mins.toString()}>
                                    {mins} min
                                  </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs w-8">{formatTime(employee.filters.arrivalHourStart)}</span>
                            <Slider
                                value={[employee.filters.arrivalHourStart, employee.filters.arrivalHourEnd]}
                                min={0}
                                max={23}
                                step={0.5}
                                onValueChange={(value) => {
                                  updateEmployee({
                                    ...employee,
                                    filters: {
                                      ...employee.filters,
                                      arrivalHourStart: value[0],
                                      arrivalHourEnd: value[1],
                                    },
                                  })
                                }}
                                className="w-24"
                            />
                            <span className="text-xs w-8">{formatTime(employee.filters.arrivalHourEnd)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <AdvancedFiltersPopover employee={employee} onUpdate={updateEmployee} />
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => duplicateEmployee(employee)}
                                title="Duplicate employee"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => removeEmployee(employee.id)}
                                className="text-destructive"
                                title="Remove employee"
                            >
                              <X className="h-4 w-4" />
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
            <Tabs defaultValue="results">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="results">Search Results</TabsTrigger>
                <TabsTrigger value="details" disabled={!selectedResult}>
                  Trip Details
                </TabsTrigger>
              </TabsList>
              <TabsContent value="results">
                <Card>
                  <CardHeader>
                    <CardTitle>Retreat Options</CardTitle>
                    <CardDescription>Results are sorted by total cost for all employees</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {searchResults.map((result) => (
                          <div
                              key={`${result.startDate}-${result.returnDate}-${result.destination}`}
                              className={cn(
                                  "border rounded-lg p-4 cursor-pointer transition-colors",
                                  selectedResult?.destination === result.destination &&
                                  selectedResult?.startDate === result.startDate &&
                                  selectedResult?.returnDate === result.returnDate
                                      ? "border-primary bg-primary/5"
                                      : "hover:bg-muted/50",
                              )}
                              onClick={() => handleResultSelect(result)}
                          >
                            <div className="flex flex-col md:flex-row justify-between md:items-center gap-2">
                              <div>
                                <h3 className="font-medium">{result.destination}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {result.startDate} to {result.returnDate}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold">{formatCurrency(result.totalCost)}</p>
                                <p className="text-sm text-muted-foreground">Total for {result.offers.length} employees</p>
                              </div>
                            </div>
                          </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="details">
                {selectedResult && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Trip to {selectedResult.destination}</CardTitle>
                        <CardDescription>
                          {selectedResult.startDate} to {selectedResult.returnDate} ·{" "}
                          {formatCurrency(selectedResult.totalCost)} total
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ScrollArea className="h-[400px] pr-4">
                          <Accordion type="single" collapsible className="w-full">
                            {selectedResult.offers.map((offer, index) => {
                              return (
                                  <AccordionItem key={index} value={`item-${index}`}>
                                    <AccordionTrigger>
                                      <div className="flex justify-between w-full pr-4">
                                <span>
                                  Employee {index + 1} ({offer.origin} to {selectedResult.destination})
                                </span>
                                        <span className="font-semibold">{formatCurrency(offer.price)}</span>
                                      </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                      <div className="space-y-4 pt-2">
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <p className="text-sm font-medium">Origin</p>
                                            <p>{offer.origin}</p>
                                          </div>
                                          <div>
                                            <p className="text-sm font-medium">Destination</p>
                                            <p>{selectedResult.destination}</p>
                                          </div>
                                          <div>
                                            <p className="text-sm font-medium">Departure</p>
                                            <p>{selectedResult.startDate}</p>
                                          </div>
                                          <div>
                                            <p className="text-sm font-medium">Return</p>
                                            <p>{selectedResult.returnDate}</p>
                                          </div>
                                          <div>
                                            <p className="text-sm font-medium">Cabin</p>
                                            <p>{getCabinName(offer.cabin)}</p>
                                          </div>
                                          <div>
                                            <p className="text-sm font-medium">Price</p>
                                            <p className="font-semibold">{formatCurrency(offer.price)}</p>
                                          </div>
                                        </div>
                                        <Separator />
                                        <Button className="w-full" asChild>
                                          <a href={offer.url} target="_blank" rel="noopener noreferrer">
                                            Book This Flight
                                          </a>
                                        </Button>
                                      </div>
                                    </AccordionContent>
                                  </AccordionItem>
                              )
                            })}
                          </Accordion>
                        </ScrollArea>
                      </CardContent>
                    </Card>
                )}
              </TabsContent>
            </Tabs>
        )}
      </div>
  )
}

