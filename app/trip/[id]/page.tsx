"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { openDB } from "idb"

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

// IndexedDB helpers
const dbName = "RetreatPlannerDB"
const storeName = "RetreatPlannerStore"

async function getDB() {
  return openDB(dbName, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName)
      }
    },
  })
}
async function loadFromDB(key: string) {
  const db = await getDB()
  return db.get(storeName, key)
}

export default function TripDetailsPage() {
  const router = useRouter()
  const { id } = useParams()
  const [tripDetails, setTripDetails] = useState<TripDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const stored = await loadFromDB("selectedTrip")
      if (stored) {
        setTripDetails(stored)
      } else {
        // Fallback if none found
        setTripDetails({
          startDate: "2025-05-01",
          returnDate: "2025-05-06",
          destination: "CUN",
          totalCost: 2000,
          offers: [
            { origin: "LAX", cabin: "BUSINESS", url: "#", price: 1200 },
            { origin: "JFK", cabin: "ECONOMY", url: "#", price: 800 },
          ],
        })
      }
      setIsLoading(false)
    })()
  }, [id])

  const formatCurrency = (amt: number) =>
      new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amt)

  const formatDate = (dateString: string) =>
      new Date(dateString).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      })

  if (isLoading) {
    return <div className="container mx-auto py-8 px-4 text-center">Loading trip details...</div>
  }

  if (!tripDetails) {
    return <div className="container mx-auto py-8 px-4 text-center">No trip details found.</div>
  }

  return (
      <div className="container mx-auto py-8 px-4">
        <Button variant="outline" className="mb-6" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Results
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              Trip to {tripDetails.destination}
              <Badge>{formatCurrency(tripDetails.totalCost)}</Badge>
            </CardTitle>
            <CardDescription>
              {formatDate(tripDetails.startDate)} – {formatDate(tripDetails.returnDate)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <h3 className="text-lg font-medium mb-4">Flight Offers</h3>
            <div className="rounded-md border">
              <Table className="text-center">
                <TableHeader>
                  <TableRow>
                    <TableHead>Origin</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tripDetails.offers.map((offer, index) => (
                      <TableRow key={index}>
                        <TableCell>{offer.origin}</TableCell>
                        <TableCell>{tripDetails.destination}</TableCell>
                        <TableCell>
                          {formatDate(tripDetails.startDate)} – {formatDate(tripDetails.returnDate)}
                        </TableCell>
                        <TableCell className="font-semibold">{formatCurrency(offer.price)}</TableCell>
                        <TableCell>
                          <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(offer.url, "_blank")}
                          >
                            Book <ExternalLink className="ml-1 h-3 w-3" />
                          </Button>
                        </TableCell>
                      </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg mt-6">
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
                      (new Date(tripDetails.returnDate).getTime() -
                          new Date(tripDetails.startDate).getTime()) /
                      (1000 * 60 * 60 * 24)
                  )}{" "}
                  nights
                </li>
                <li>
                  <span className="font-medium">Total Cost:</span>{" "}
                  {formatCurrency(tripDetails.totalCost)}
                </li>
                <li>
                  <span className="font-medium">Number of Employees:</span> {tripDetails.offers.length}
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}
