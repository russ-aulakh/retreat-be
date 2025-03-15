"use client"

import { useState } from "react"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import type { Employee } from "./retreat-planner"

interface AdvancedFiltersPopoverProps {
    employee: Employee
    onUpdate: (employee: Employee) => void
}

export default function AdvancedFiltersPopover({ employee, onUpdate }: AdvancedFiltersPopoverProps) {
    const [open, setOpen] = useState(false)

    // Format time from hours (0-24) to display format
    const formatTime = (hours: number) => {
        const h = Math.floor(hours)
        const m = Math.round((hours - h) * 60)
        return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
    }

    const updateFilter = <K extends keyof Employee["filters"]>(key: K, value: Employee["filters"][K]) => {
        onUpdate({
            ...employee,
            filters: {
                ...employee.filters,
                [key]: value,
            },
        })
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

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon" title="Advanced filters">
                    <Settings className="h-4 w-4" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
                <div className="p-4 pb-0">
                    <h3 className="font-medium">Advanced Filters</h3>
                    <p className="text-sm text-muted-foreground">Configure additional flight preferences</p>
                </div>
                <Tabs defaultValue="time" className="p-4">
                    <TabsList className="grid grid-cols-4 mb-2">
                        <TabsTrigger value="time">Time</TabsTrigger>
                        <TabsTrigger value="passengers">Passengers</TabsTrigger>
                        <TabsTrigger value="price">Price</TabsTrigger>
                        <TabsTrigger value="other">Other</TabsTrigger>
                    </TabsList>

                    <TabsContent value="time" className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs">Departure Hours</Label>
                            <div className="flex items-center space-x-2">
                                <span className="text-xs w-8">{formatTime(employee.filters.departHourStart)}</span>
                                <Slider
                                    value={[employee.filters.departHourStart, employee.filters.departHourEnd]}
                                    min={0}
                                    max={24}
                                    step={0.5}
                                    onValueChange={(value) => {
                                        updateFilter("departHourStart", value[0])
                                        updateFilter("departHourEnd", value[1])
                                    }}
                                />
                                <span className="text-xs w-8">{formatTime(employee.filters.departHourEnd)}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs">Arrival Hours</Label>
                            <div className="flex items-center space-x-2">
                                <span className="text-xs w-8">{formatTime(employee.filters.arrivalHourStart)}</span>
                                <Slider
                                    value={[employee.filters.arrivalHourStart, employee.filters.arrivalHourEnd]}
                                    min={0}
                                    max={24}
                                    step={0.5}
                                    onValueChange={(value) => {
                                        updateFilter("arrivalHourStart", value[0])
                                        updateFilter("arrivalHourEnd", value[1])
                                    }}
                                />
                                <span className="text-xs w-8">{formatTime(employee.filters.arrivalHourEnd)}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs">Layover Duration (min)</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label className="text-xs">Min</Label>
                                    <Input
                                        type="number"
                                        value={employee.filters.minLayover}
                                        onChange={(e) => updateFilter("minLayover", Number(e.target.value))}
                                        min={0}
                                        max={employee.filters.maxLayover}
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs">Max</Label>
                                    <Input
                                        type="number"
                                        value={employee.filters.maxLayover}
                                        onChange={(e) => updateFilter("maxLayover", Number(e.target.value))}
                                        min={employee.filters.minLayover}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs">Max Flight Duration (min)</Label>
                            <Input
                                type="number"
                                value={employee.filters.flightDuration}
                                onChange={(e) => updateFilter("flightDuration", Number(e.target.value))}
                                min={0}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="passengers" className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs">Adults</Label>
                            <Input
                                type="number"
                                value={employee.filters.passengerType.adults}
                                onChange={(e) => updatePassengerType("adults", Number(e.target.value))}
                                min={1}
                                max={9}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs">Children</Label>
                            <Input
                                type="number"
                                value={employee.filters.passengerType.children}
                                onChange={(e) => updatePassengerType("children", Number(e.target.value))}
                                min={0}
                                max={9}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs">Infant (in seat)</Label>
                            <Input
                                type="number"
                                value={employee.filters.passengerType.infantInSeat}
                                onChange={(e) => updatePassengerType("infantInSeat", Number(e.target.value))}
                                min={0}
                                max={9}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs">Infant (on lap)</Label>
                            <Input
                                type="number"
                                value={employee.filters.passengerType.infantOnLap}
                                onChange={(e) => updatePassengerType("infantOnLap", Number(e.target.value))}
                                min={0}
                                max={9}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="price" className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs">Max Price</Label>
                            <Input
                                type="number"
                                value={employee.filters.maxPrice}
                                onChange={(e) => updateFilter("maxPrice", Number(e.target.value))}
                                min={0}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs">Currency</Label>
                            <Select value={employee.filters.currency} onValueChange={(value) => updateFilter("currency", value)}>
                                <SelectTrigger>
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

                        <div className="flex items-center space-x-2">
                            <Switch
                                id="separate-tickets"
                                checked={employee.filters.showSeparateTickets}
                                onCheckedChange={(checked) => updateFilter("showSeparateTickets", checked)}
                            />
                            <Label htmlFor="separate-tickets" className="text-xs">
                                Show separate tickets
                            </Label>
                        </div>
                    </TabsContent>

                    <TabsContent value="other" className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-xs">Language</Label>
                            <Select value={employee.filters.language} onValueChange={(value) => updateFilter("language", value)}>
                                <SelectTrigger>
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

                        <div className="space-y-2">
                            <Label className="text-xs">Bags</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label className="text-xs">Carry-on</Label>
                                    <Input
                                        type="number"
                                        value={employee.filters.totalCarryOnBags}
                                        onChange={(e) => updateFilter("totalCarryOnBags", Number(e.target.value))}
                                        min={0}
                                        max={9}
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs">Checked</Label>
                                    <Input
                                        type="number"
                                        value={employee.filters.totalCheckedBags}
                                        onChange={(e) => updateFilter("totalCheckedBags", Number(e.target.value))}
                                        min={0}
                                        max={9}
                                    />
                                </div>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="emissions"
                                    checked={employee.filters.emissions}
                                    onCheckedChange={(checked) => updateFilter("emissions", checked)}
                                />
                                <Label htmlFor="emissions" className="text-xs">
                                    Show emissions data
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <Switch
                                    id="avoid-us"
                                    checked={employee.filters.avoidUSConnections}
                                    onCheckedChange={(checked) => updateFilter("avoidUSConnections", checked)}
                                />
                                <Label htmlFor="avoid-us" className="text-xs">
                                    Avoid US connections
                                </Label>
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

