// "use client" not required for simple type exports

// Shared types
export type Employee = {
    id: string
    employeeName: string
    origin: string
    cabin: string
    filters: {
        numStops: string
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

export type TripParams = {
    startDate: Date | undefined
    returnDate: Date | undefined
    destinations: string[]
    minTripLength: number
    maxTripLength: number
    tripType: string
}

export type SearchResult = {
    startDate: string
    returnDate: string
    destination: string
    totalCost: number
    offers: EmployeeOffer[]
}

export type EmployeeOffer = {
    origin: string
    cabin: string
    url: string
    price: number
}