"use client"

import { useState } from "react"
import { Settings, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Employee } from "@/components/types"

interface AdvancedFiltersPopoverProps {
  employee: Employee
  onUpdate: (employee: Employee) => void
}

export default function AdvancedFiltersPopover({ employee, onUpdate }: AdvancedFiltersPopoverProps) {
  const [open, setOpen] = useState(false)
  const [airlineInput, setAirlineInput] = useState("")
  const [excludedAirlineInput, setExcludedAirlineInput] = useState("")
  const [airportInput, setAirportInput] = useState("")
  const [excludedAirportInput, setExcludedAirportInput] = useState("")

  // Helper to format hour input as HH:mm
  const formatTime = (hours: number) => {
    const h = Math.floor(hours)
    const m = Math.round((hours - h) * 60)
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
  }

  const updateFilter = <K extends keyof Employee["filters"]>(key: K, value: Employee["filters"][K]) => {
    onUpdate({ ...employee, filters: { ...employee.filters, [key]: value } })
  }

  const updatePassengerType = <K extends keyof Employee["filters"]["passengerType"]>(
      key: K,
      value: Employee["filters"]["passengerType"][K],
  ) => {
    onUpdate({
      ...employee,
      filters: {
        ...employee.filters,
        passengerType: {
          ...employee.filters.passengerType,
          [key]: value,
        },
      },
    })
  }

  const addToList = (value: string, existing: string[], filterKey: keyof Employee["filters"], resetFn: () => void) => {
    const trimmed = value.trim().toUpperCase()
    if (trimmed && !existing.includes(trimmed)) {
      updateFilter(filterKey, [...existing, trimmed])
      resetFn()
    }
  }

  // Flight durations in minutes
  const flightDurationOptions = [
    { label: "3 hours", value: 180 },
    { label: "5 hours", value: 300 },
    { label: "10 hours", value: 600 },
    { label: "15 hours", value: 900 },
    { label: "20 hours", value: 1200 },
    { label: "30 hours", value: 1800 },
    { label: "Any", value: 3000 },
  ]

  // Layover options in minutes
  const layoverOptions = [
    { label: "1 hour", value: 60 },
    { label: "2 hours", value: 120 },
    { label: "3 hours", value: 180 },
    { label: "4 hours", value: 240 },
    { label: "5 hours", value: 300 },
    { label: "6 hours", value: 360 },
    { label: "10 hours", value: 600 },
    { label: "Any", value: 1800 },
  ]

  return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon" title="Advanced filters">
            <Settings className="h-4 w-4" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="max-h-[500px] overflow-y-auto w-[500px] p-0" align="start">
          <div className="p-4 pb-0">
            <h3 className="font-medium">Advanced Filters</h3>
            <p className="text-sm text-muted-foreground">Configure extra flight preferences</p>
          </div>
          <Tabs defaultValue="time" className="p-4">
            <TabsList className="grid grid-cols-4 mb-2">
              <TabsTrigger value="time">Time</TabsTrigger>
              <TabsTrigger value="airlines">Airlines</TabsTrigger>
              <TabsTrigger value="airports">Airports</TabsTrigger>
              <TabsTrigger value="other">Other</TabsTrigger>
            </TabsList>

            {/* Time tab */}
            <TabsContent value="time" className="space-y-4">
              <div className="space-y-3">
                {/* Departure window */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Departure Window</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs">Start Hour (0-23)</Label>
                      <Input
                          type="number"
                          min={0}
                          max={23}
                          value={employee.filters.departHourStart}
                          onChange={(e) =>
                              updateFilter("departHourStart", Math.min(23, Math.max(0, Number(e.target.value) || 0)))
                          }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">End Hour (0-23)</Label>
                      <Input
                          type="number"
                          min={0}
                          max={23}
                          value={employee.filters.departHourEnd}
                          onChange={(e) =>
                              updateFilter("departHourEnd", Math.min(23, Math.max(0, Number(e.target.value) || 0)))
                          }
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Departure window: {formatTime(employee.filters.departHourStart)} – {formatTime(employee.filters.departHourEnd)}
                  </p>
                </div>

                {/* Arrival window */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">Arrival Window</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs">Start Hour (0-23)</Label>
                      <Input
                          type="number"
                          min={0}
                          max={23}
                          value={employee.filters.arrivalHourStart}
                          onChange={(e) =>
                              updateFilter("arrivalHourStart", Math.min(23, Math.max(0, Number(e.target.value) || 0)))
                          }
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">End Hour (0-23)</Label>
                      <Input
                          type="number"
                          min={0}
                          max={23}
                          value={employee.filters.arrivalHourEnd}
                          onChange={(e) =>
                              updateFilter("arrivalHourEnd", Math.min(23, Math.max(0, Number(e.target.value) || 0)))
                          }
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Arrival window: {formatTime(employee.filters.arrivalHourStart)} – {formatTime(employee.filters.arrivalHourEnd)}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Layover & Flight duration */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Maximum Layover</Label>
                <RadioGroup
                    value={employee.filters.maxLayover.toString()}
                    onValueChange={(val) => updateFilter("maxLayover", Number(val))}
                    className="grid grid-cols-2 gap-2"
                >
                  {layoverOptions.map((opt) => (
                      <div key={opt.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={opt.value.toString()} id={`layover-${opt.value}`} />
                        <Label htmlFor={`layover-${opt.value}`} className="text-sm">
                          {opt.label}
                        </Label>
                      </div>
                  ))}
                </RadioGroup>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-sm font-medium">Max Flight Duration</Label>
                <RadioGroup
                    value={employee.filters.flightDuration.toString()}
                    onValueChange={(val) => updateFilter("flightDuration", Number(val))}
                    className="grid grid-cols-2 gap-2"
                >
                  {flightDurationOptions.map((opt) => (
                      <div key={opt.value} className="flex items-center space-x-2">
                        <RadioGroupItem value={opt.value.toString()} id={`duration-${opt.value}`} />
                        <Label htmlFor={`duration-${opt.value}`} className="text-sm">
                          {opt.label}
                        </Label>
                      </div>
                  ))}
                </RadioGroup>
              </div>
            </TabsContent>

            {/* Airlines tab */}
            <TabsContent value="airlines" className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Preferred Airlines</Label>
                <p className="text-xs text-muted-foreground">Only show flights with these 2-letter airline codes.</p>
                <div className="flex gap-2">
                  <Input
                      value={airlineInput}
                      onChange={(e) => setAirlineInput(e.target.value.toUpperCase().slice(0, 2))}
                      placeholder="AA"
                      className="uppercase font-mono"
                      maxLength={2}
                  />
                  <Button
                      size="sm"
                      onClick={() =>
                          addToList(airlineInput, employee.filters.onlyAirlines, "onlyAirlines", () => setAirlineInput(""))
                      }
                      disabled={!/^[A-Z]{2}$/.test(airlineInput)}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {employee.filters.onlyAirlines.map((airline) => (
                      <Badge key={airline} variant="secondary" className="font-mono">
                        {airline}
                        <X
                            className="ml-1 h-3 w-3 cursor-pointer"
                            onClick={() =>
                                updateFilter(
                                    "onlyAirlines",
                                    employee.filters.onlyAirlines.filter((a) => a !== airline),
                                )
                            }
                        />
                      </Badge>
                  ))}
                  {employee.filters.onlyAirlines.length === 0 && (
                      <span className="text-xs text-muted-foreground">No preferred airlines</span>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-sm font-medium">Excluded Airlines</Label>
                <p className="text-xs text-muted-foreground">Don’t show flights with these airlines.</p>
                <div className="flex gap-2">
                  <Input
                      value={excludedAirlineInput}
                      onChange={(e) => setExcludedAirlineInput(e.target.value.toUpperCase().slice(0, 2))}
                      placeholder="AA"
                      className="uppercase font-mono"
                      maxLength={2}
                  />
                  <Button
                      size="sm"
                      onClick={() =>
                          addToList(
                              excludedAirlineInput,
                              employee.filters.excludedAirlines,
                              "excludedAirlines",
                              () => setExcludedAirlineInput(""),
                          )
                      }
                      disabled={!/^[A-Z]{2}$/.test(excludedAirlineInput)}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {employee.filters.excludedAirlines.map((airline) => (
                      <Badge key={airline} variant="outline" className="font-mono">
                        {airline}
                        <X
                            className="ml-1 h-3 w-3 cursor-pointer"
                            onClick={() =>
                                updateFilter(
                                    "excludedAirlines",
                                    employee.filters.excludedAirlines.filter((a) => a !== airline),
                                )
                            }
                        />
                      </Badge>
                  ))}
                  {employee.filters.excludedAirlines.length === 0 && (
                      <span className="text-xs text-muted-foreground">No excluded airlines</span>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Airports tab */}
            <TabsContent value="airports" className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Preferred Airports</Label>
                <p className="text-xs text-muted-foreground">Only allow connections via these airports.</p>
                <div className="flex gap-2">
                  <Input
                      value={airportInput}
                      onChange={(e) => setAirportInput(e.target.value.toUpperCase().slice(0, 3))}
                      placeholder="JFK"
                      className="uppercase font-mono"
                      maxLength={3}
                  />
                  <Button
                      size="sm"
                      onClick={() =>
                          addToList(airportInput, employee.filters.onlyAirports, "onlyAirports", () => setAirportInput(""))
                      }
                      disabled={!/^[A-Z]{3}$/.test(airportInput)}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {employee.filters.onlyAirports.map((ap) => (
                      <Badge key={ap} variant="secondary" className="font-mono">
                        {ap}
                        <X
                            className="ml-1 h-3 w-3 cursor-pointer"
                            onClick={() =>
                                updateFilter(
                                    "onlyAirports",
                                    employee.filters.onlyAirports.filter((a) => a !== ap),
                                )
                            }
                        />
                      </Badge>
                  ))}
                  {employee.filters.onlyAirports.length === 0 && (
                      <span className="text-xs text-muted-foreground">No preferred airports</span>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-sm font-medium">Excluded Airports</Label>
                <p className="text-xs text-muted-foreground">Don’t allow connections via these airports.</p>
                <div className="flex gap-2">
                  <Input
                      value={excludedAirportInput}
                      onChange={(e) => setExcludedAirportInput(e.target.value.toUpperCase().slice(0, 3))}
                      placeholder="LHR"
                      className="uppercase font-mono"
                      maxLength={3}
                  />
                  <Button
                      size="sm"
                      onClick={() =>
                          addToList(
                              excludedAirportInput,
                              employee.filters.excludedAirports,
                              "excludedAirports",
                              () => setExcludedAirportInput(""),
                          )
                      }
                      disabled={!/^[A-Z]{3}$/.test(excludedAirportInput)}
                  >
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {employee.filters.excludedAirports.map((ap) => (
                      <Badge key={ap} variant="outline" className="font-mono">
                        {ap}
                        <X
                            className="ml-1 h-3 w-3 cursor-pointer"
                            onClick={() =>
                                updateFilter(
                                    "excludedAirports",
                                    employee.filters.excludedAirports.filter((a) => a !== ap),
                                )
                            }
                        />
                      </Badge>
                  ))}
                  {employee.filters.excludedAirports.length === 0 && (
                      <span className="text-xs text-muted-foreground">No excluded airports</span>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Other tab */}
            <TabsContent value="other" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">Currency</Label>
                  <Select
                      value={employee.filters.currency}
                      onValueChange={(val) => updateFilter("currency", val)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Language</Label>
                  <Select
                      value={employee.filters.language}
                      onValueChange={(val) => updateFilter("language", val)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es-ES">Spanish</SelectItem>
                      <SelectItem value="fr-FR">French</SelectItem>
                      <SelectItem value="de-DE">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />


              <div className="space-y-2">
                <Label className="text-sm font-medium">Baggage</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Carry-on Bags</Label>
                    <Input
                        type="number"
                        min={0}
                        max={9}
                        value={employee.filters.totalCarryOnBags}
                        onChange={(e) =>
                            updateFilter("totalCarryOnBags", Number(e.target.value))
                        }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Checked Bags</Label>
                    <Input
                        type="number"
                        min={0}
                        max={9}
                        value={employee.filters.totalCheckedBags}
                        onChange={(e) =>
                            updateFilter("totalCheckedBags", Number(e.target.value))
                        }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label className="text-sm font-medium">Additional Options</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                        checked={employee.filters.showSeparateTickets}
                        onCheckedChange={(checked) => updateFilter("showSeparateTickets", checked)}
                    />
                    <Label className="text-sm">Include separate tickets</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                        checked={employee.filters.emissions}
                        onCheckedChange={(checked) => updateFilter("emissions", checked)}
                    />
                    <Label className="text-sm">Only low emission flights</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                        checked={employee.filters.avoidUSConnections}
                        onCheckedChange={(checked) => updateFilter("avoidUSConnections", checked)}
                    />
                    <Label className="text-sm">Avoid US connections</Label>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex items-center justify-end gap-2 p-4 pt-0">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </PopoverContent>
      </Popover>
  )
}