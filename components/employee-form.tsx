"use client"

import { useState } from "react"
import { ChevronDown, Settings, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { Employee } from "./retreat-planner"

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

  const handleFilterChange = (key: keyof Employee["filters"], value: string | number) => {
    onUpdate({
      ...employee,
      filters: {
        ...employee.filters,
        [key]: value,
      },
    })
  }

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Origin */}
              <div className="space-y-2">
                <Label htmlFor={`origin-${employee.id}`}>Origin</Label>
                <Select value={employee.origin} onValueChange={handleOriginChange}>
                  <SelectTrigger id={`origin-${employee.id}`}>
                    <SelectValue placeholder="Select origin" />
                  </SelectTrigger>
                  <SelectContent>
                    {originOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
              <CollapsibleContent className="pt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Number of Stops */}
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

                  {/* Max Price */}
                  <div className="space-y-2">
                    <Label htmlFor={`price-${employee.id}`}>Max Price ($)</Label>
                    <Input
                        id={`price-${employee.id}`}
                        type="number"
                        value={employee.filters.maxPrice}
                        onChange={(e) => handleFilterChange("maxPrice", Number.parseInt(e.target.value))}
                    />
                  </div>

                  {/* Max Layover */}
                  <div className="space-y-2">
                    <Label htmlFor={`layover-${employee.id}`}>Max Layover (min)</Label>
                    <Input
                        id={`layover-${employee.id}`}
                        type="number"
                        value={employee.filters.maxLayover}
                        onChange={(e) => handleFilterChange("maxLayover", Number.parseInt(e.target.value))}
                    />
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CardContent>
      </Card>
  )
}

