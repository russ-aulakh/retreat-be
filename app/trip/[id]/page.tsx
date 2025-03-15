"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

type EmployeeOffer = {
    origin: string
    cabin?: string
    url: string
    price: number
}

type TripDetails = {
    startDate: string
    returnDate: string
    destination: string
    totalCost: number
    offers: EmployeeOffer[]
}

export default function TripDetailsPage({ params }: { params: { id: string } }) {
    const router = useRouter()
    const [tripDetails, setTripDetails] = useState<TripDetails | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        // In a real app, you would fetch the data for this specific trip
        // For now, we'll use the data from localStorage that was saved when the user clicked on a result
        const fetchTripDetails = async () => {
            try {
                const storedData = localStorage.getItem("selectedTrip")
                if (storedData) {
                    setTripDetails(JSON.parse(storedData))
                } else {
                    // Fallback to mock data if nothing is in localStorage
                    setTripDetails({
                        startDate: "2025-05-04",
                        returnDate: "2025-05-09",
                        destination: "CUN",
                        totalCost: 1004,
                        offers: [
                            {
                                origin: "LAX",
                                url: "https://www.google.com/travel/flights/booking?tfs=GicSCjIwMjUtMDUtMDQoAGC4F2oHCAESA0xBWHIHCAESA0NVTpABpAMaJxIKMjAyNS0wNS0wOSgAYLgXagcIARIDQ1VOcgcIARIDTEFYkAGkA0IBAUgDYMCaDGoAiAEBmAEB&curr=USD&hl=en-US&gl=US&tfu=EgYIAhAAGAA",
                                price: 728,
                            },
                            {
                                origin: "JFK",
                                url: "https://www.google.com/travel/flights/booking?tfs=GicSCjIwMjUtMDUtMDQoAGC4F2oHCAESA0pGS3IHCAESA0NVTpABpAMaJxIKMjAyNS0wNS0wOSgAYLgXagcIARIDQ1VOcgcIARIDSkZLkAGkA0IBAUgBYMCaDGoAiAEBmAEB&curr=USD&hl=en-US&gl=US&tfu=EgYIAhAAGAA",
                                price: 276,
                            },
                        ],
                    })
                }
            } catch (error) {
                console.error("Error fetching trip details:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchTripDetails()
    }, [params.id])

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
        }).format(amount)
    }

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleDateString("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            year: "numeric",
        })
    }

    // Handle booking link click
    const handleBookingClick = (url: string) => {
        window.open(url, "_blank")
    }

    if (isLoading) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="flex justify-center items-center h-64">
                    <p className="text-lg">Loading trip details...</p>
                </div>
            </div>
        )
    }

    if (!tripDetails) {
        return (
            <div className="container mx-auto py-8 px-4">
                <div className="flex justify-center items-center h-64">
                    <p className="text-lg">Trip details not found</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <Button variant="outline" className="mb-6" onClick={() => router.back()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Search Results
            </Button>

            <Card className="mb-8">
                <CardHeader className="pb-4">
                    <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                        <div>
                            <CardTitle className="text-2xl md:text-3xl flex items-center gap-2">
                                Trip to {tripDetails.destination}
                                <Badge className="ml-2">{formatCurrency(tripDetails.totalCost)}</Badge>
                            </CardTitle>
                            <CardDescription className="text-base mt-1">
                                {formatDate(tripDetails.startDate)} - {formatDate(tripDetails.returnDate)}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-medium mb-4">Flight Offers</h3>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Origin</TableHead>
                                            <TableHead>Destination</TableHead>
                                            <TableHead>Dates</TableHead>
                                            <TableHead className="text-right">Price</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {tripDetails.offers.map((offer, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="font-medium">{offer.origin}</TableCell>
                                                <TableCell>{tripDetails.destination}</TableCell>
                                                <TableCell>
                                                    {formatDate(tripDetails.startDate)} - {formatDate(tripDetails.returnDate)}
                                                </TableCell>
                                                <TableCell className="text-right font-semibold">{formatCurrency(offer.price)}</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="outline" size="sm" onClick={() => handleBookingClick(offer.url)}>
                                                        Book Flight
                                                        <ExternalLink className="ml-1 h-3 w-3" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>

                        <div className="bg-muted/50 p-4 rounded-lg">
                            <h3 className="text-sm font-medium mb-2">Trip Summary</h3>
                            <ul className="space-y-1 text-sm">
                                <li>
                                    <span className="font-medium">Destination:</span> {tripDetails.destination}
                                </li>
                                <li>
                                    <span className="font-medium">Departure:</span> {formatDate(tripDetails.startDate)}
                                </li>
                                <li>
                                    <span className="font-medium">Return:</span> {formatDate(tripDetails.returnDate)}
                                </li>
                                <li>
                                    <span className="font-medium">Trip Length:</span>{" "}
                                    {Math.round(
                                        (new Date(tripDetails.returnDate).getTime() - new Date(tripDetails.startDate).getTime()) /
                                        (1000 * 60 * 60 * 24),
                                    )}{" "}
                                    nights
                                </li>
                                <li>
                                    <span className="font-medium">Total Cost:</span> {formatCurrency(tripDetails.totalCost)}
                                </li>
                                <li>
                                    <span className="font-medium">Number of Employees:</span> {tripDetails.offers.length}
                                </li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

