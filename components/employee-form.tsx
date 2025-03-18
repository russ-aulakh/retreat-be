"use client"

import { useState } from "react"
import { ChevronDown, Settings, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import type { Employee } from "./types"

type EmployeeFormProps = {
  employee: Employee
  onUpdate: (employee: Employee) => void
  onRemove: (id: string) => void
  originOptions: { value: string; label: string }[]
  cabinOptions: { value: string; label: string }[]
  stopOptions: { value: string; label: string }[]
}

export default function EmployeeForm({
  employee,
  onUpdate,
  onRemove,
  originOptions,
  cabinOptions,
  stopOptions,
}: EmployeeFormProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleOriginChange = (origin: string) => {
    onUpdate({ ...employee, origin })
  }

  const handleCabinChange = (cabin: string) => {
    onUpdate({ ...employee, cabin })
  }

  const handleFilterChange = (key: keyof Employee["filters"], value: string | number | string[]) => {
    onUpdate({
      ...employee,
      filters: {
        ...employee.filters,
        [key]: value,
      },
    })
  }

  // Format time from hours (0-23) hour range
  const formatTime = (hours: number) => {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
  }

  // Max layover options
  const layoverOptions = [
    { value: "60", label: "1 hour" },
    { value: "120", label: "2 hours" },
    { value: "180", label: "3 hours" },
    { value: "240", label: "4 hours" },
    { value: "300", label: "5 hours" },
    { value: "360", label: "6 hours" },
    { value: "1800", label: "Any" },
  ]

  return (
    <Card className="border">
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">Employee {employee.id.replace("emp", "")}</h3>
            <Button variant="ghost" size="icon" onClick={() => onRemove(employee.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Origin */}
            <div className="space-y-2">
              <Label htmlFor={`origin-${employee.id}`}>Origin</Label>
              <Input
                id={`origin-${employee.id}`}
                value={employee.origin}
                onChange={(e) => handleOriginChange(e.target.value.toUpperCase().slice(0, 3))}
                className="uppercase"
                maxLength={3}
                placeholder="JFK"
              />
            </div>

            {/* Cabin */}
            <div className="space-y-2">
              <Label htmlFor={`cabin-${employee.id}`}>Cabin</Label>
              <Select value={employee.cabin} onValueChange={handleCabinChange}>
                <SelectTrigger id={`cabin-${employee.id}`}>
                  <SelectValue placeholder="Select cabin" />
                </SelectTrigger>
                <SelectContent>
                  {cabinOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stops and Max Layover */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`stops-${employee.id}`}>Stops</Label>
              <Select
                value={employee.filters.numStops}
                onValueChange={(value) => handleFilterChange("numStops", value)}
              >
                <SelectTrigger id={`stops-${employee.id}`}>
                  <SelectValue placeholder="Select stops" />
                </SelectTrigger>
                <SelectContent>
                  {stopOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`max-layover-${employee.id}`}>Max Layover</Label>
              <Select
                value={employee.filters.maxLayover.toString()}
                onValueChange={(value) => handleFilterChange("maxLayover", Number(value))}
              >
                <SelectTrigger id={`max-layover-${employee.id}`}>
                  <SelectValue placeholder="Select max layover" />
                </SelectTrigger>
                <SelectContent>
                  {layoverOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Only Airlines */}
          <div className="space-y-2">
            <Label htmlFor={`airlines-${employee.id}`}>Only Airlines (2-letter IATA codes)</Label>
            <Input
              id={`airlines-${employee.id}`}
              value={employee.filters.onlyAirlines.join(", ")}
              onChange={(e) => {
                const airlines = e.target.value
                  .split(",")
                  .map((code) => code.trim().toUpperCase())
                  .filter((code) => code.length > 0)

                handleFilterChange("onlyAirlines", airlines)
              }}
              placeholder="AA, DL, UA"
              className="uppercase"
            />
            <p className="text-xs text-muted-foreground">Comma-separated list of airline codes</p>
          </div>

          {/* Arrival Hours Slider */}
          <div className="space-y-2">
            <Label>
              Arrival Hours: {formatTime(employee.filters.arrivalHourStart)} -{" "}
              {formatTime(employee.filters.arrivalHourEnd)}
            </Label>
            <Slider
              value={[employee.filters.arrivalHourStart, employee.filters.arrivalHourEnd]}
              min={0}
              max={23}
              step={1}
              onValueChange={(value) => {
                handleFilterChange("arrivalHourStart", value[0])
                handleFilterChange("arrivalHourEnd", value[1])
              }}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>00:00</span>
              <span>12:00</span>
              <span>23:00</span>
            </div>
          </div>

          <Separator className="my-2" />

          {/* Advanced Filters */}
          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="w-full flex justify-between">
                <span className="flex items-center">
                  <Settings className="mr-2 h-4 w-4" />
                  Advanced Filters
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-4 space-y-6">
              {/* Departure Hours Slider */}
              <div className="space-y-2">
                <Label>
                  Departure Hours: {formatTime(employee.filters.departHourStart)} -{" "}
                  {formatTime(employee.filters.departHourEnd)}
                </Label>
                <Slider
                  value={[employee.filters.departHourStart, employee.filters.departHourEnd]}
                  min={0}
                  max={23}
                  step={1}
                  onValueChange={(value) => {
                    handleFilterChange("departHourStart", value[0])
                    handleFilterChange("departHourEnd", value[1])
                  }}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>00:00</span>
                  <span>12:00</span>
                  <span>23:00</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Min Layover */}
                <div className="space-y-2">
                  <Label htmlFor={`min-layover-${employee.id}`}>Min Layover (min)</Label>
                  <Input
                    id={`min-layover-${employee.id}`}
                    type="number"
                    value={employee.filters.minLayover}
                    onChange={(e) => handleFilterChange("minLayover", Number(e.target.value))}
                    min={0}
                    max={employee.filters.maxLayover}
                  />
                </div>

                {/* Max Flight Duration */}
                <div className="space-y-2">
                  <Label htmlFor={`flight-duration-${employee.id}`}>Max Flight Duration (min)</Label>
                  <Input
                    id={`flight-duration-${employee.id}`}
                    type="number"
                    value={employee.filters.flightDuration}
                    onChange={(e) => handleFilterChange("flightDuration", Number(e.target.value))}
                    min={0}
                  />
                </div>
              </div>

              <Separator />

              {/* Airlines and Airports */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Airlines & Airports</h4>

                <div className="space-y-2">
                  <Label htmlFor={`excluded-airlines-${employee.id}`}>Excluded Airlines</Label>
                  <Input
                    id={`excluded-airlines-${employee.id}`}
                    value={employee.filters.excludedAirlines.join(", ")}
                    onChange={(e) => {
                      const airlines = e.target.value
                        .split(",")
                        .map((code) => code.trim().toUpperCase())
                        .filter((code) => code.length > 0)

                      handleFilterChange("excludedAirlines", airlines)
                    }}
                    placeholder="AA, DL, UA"
                    className="uppercase"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`only-airports-${employee.id}`}>Only Airports</Label>
                    <Input
                      id={`only-airports-${employee.id}`}
                      value={employee.filters.onlyAirports.join(", ")}
                      onChange={(e) => {
                        const airports = e.target.value
                          .split(",")
                          .map((code) => code.trim().toUpperCase())
                          .filter((code) => code.length > 0)

                        handleFilterChange("onlyAirports", airports)
                      }}
                      placeholder="JFK, LAX, ORD"
                      className="uppercase"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`excluded-airports-${employee.id}`}>Excluded Airports</Label>
                    <Input
                      id={`excluded-airports-${employee.id}`}
                      value={employee.filters.excludedAirports.join(", ")}
                      onChange={(e) => {
                        const airports = e.target.value
                          .split(",")
                          .map((code) => code.trim().toUpperCase())
                          .filter((code) => code.length > 0)

                        handleFilterChange("excludedAirports", airports)
                      }}
                      placeholder="JFK, LAX, ORD"
                      className="uppercase"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Passenger and Baggage */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Passenger & Baggage</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`currency-${employee.id}`}>Currency</Label>
                    <Select
                      value={employee.filters.currency}
                      onValueChange={(value) => handleFilterChange("currency", value)}
                    >
                      <SelectTrigger id={`currency-${employee.id}`}>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="CAD">CAD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`language-${employee.id}`}>Language</Label>
                    <Select
                      value={employee.filters.language}
                      onValueChange={(value) => handleFilterChange("language", value)}
                    >
                      <SelectTrigger id={`language-${employee.id}`}>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="es-ES">Spanish</SelectItem>
                        <SelectItem value="fr-FR">French</SelectItem>
                        <SelectItem value="de-DE">German</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`carry-on-${employee.id}`}>Carry-on Bags</Label>
                    <Input
                      id={`carry-on-${employee.id}`}
                      type="number"
                      value={employee.filters.totalCarryOnBags}
                      onChange={(e) => handleFilterChange("totalCarryOnBags", Number(e.target.value))}
                      min={0}
                      max={9}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`checked-${employee.id}`}>Checked Bags</Label>
                    <Input
                      id={`checked-${employee.id}`}
                      type="number"
                      value={employee.filters.totalCheckedBags}
                      onChange={(e) => handleFilterChange("totalCheckedBags", Number(e.target.value))}
                      min={0}
                      max={9}
                    />
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  )
}

