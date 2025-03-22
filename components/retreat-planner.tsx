"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Copy, Plus, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { openDB } from "idb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

import CloseIcon from "@mui/icons-material/Close";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import {
  Box,
  Grid,
  Table as MuiTable,
  Dialog,
  TableRow as MuiTableRow,
  TableHead as MuiTableHead,
  TableBody as MuiTableBody,
  TableCell as MuiTableCell,
  IconButton,
  Typography,
  DialogTitle,
  DialogContent,
} from "@mui/material";

import AdvancedFiltersPopover from "./improved-filters-popover";
import type { IAirportShortcut } from "./types";
import type { Employee, TripParams, SearchResult } from "@/components/types";

// ------------------------------------------------------
// Example region shortcuts
// ------------------------------------------------------

export const airportShortcuts: IAirportShortcut[] = [
  {
    code: 'AFRX',
    name: 'Africa',
    airport_codes: ['ADD', 'CAI', 'CPT', 'JNB', 'LOS', 'NBO'],
  },
  {
    code: 'ANZX',
    name: 'Australia \u0026 New Zealand',
    airport_codes: ['AKL', 'BNE', 'MEL', 'PER', 'SYD'],
  },
  {
    code: 'BALX',
    name: 'Balkans',
    airport_codes: ['BEG', 'SOF', 'TIV', 'ZAG'],
  },
  {
    code: 'BJSX',
    name: 'Beijing, China ',
    airport_codes: ['PEK', 'PKX'],
  },
  {
    code: 'CALX',
    name: 'California',
    airport_codes: ['LAX', 'OAK', 'SAN', 'SFO', 'SJC', 'SMF'],
  },
  {
    code: 'CADX',
    name: 'Canada',
    airport_codes: ['YEG', 'YHZ', 'YOW', 'YQB', 'YQR', 'YUL', 'YVR', 'YWG', 'YXE', 'YYC', 'YYZ'],
  },
  {
    code: 'CAMX',
    name: 'Cameroon',
    airport_codes: ['DLA', 'NSI'],
  },

  {
    code: 'CARX',
    name: 'Caribbean',
    airport_codes: [
      'ANU',
      'AUA',
      'AXA',
      'BGI',
      'BON',
      'CUR',
      'HAV',
      'MBJ',
      'PUJ',
      'SDQ',
      'SJU',
      'STT',
      'STX',
      'SXM',
    ],
  },
  {
    code: 'CEMX',
    name: 'Central America',
    airport_codes: ['BZE', 'GUA', 'PTY', 'SAL', 'SJO'],
  },
  {
    code: 'CHIX',
    name: 'Chicago, Illinois ',
    airport_codes: ['MDW', 'ORD'],
  },
  {
    code: 'ASAX',
    name: 'East Asia',
    airport_codes: ['BKK', 'HKG', 'HND', 'ICN', 'KUL', 'NRT', 'PEK', 'PKX', 'PVG', 'SIN', 'TPE'],
  },
  {
    code: 'ESTX',
    name: 'East Coast, United States ',
    airport_codes: ['BOS', 'CLT', 'DCA', 'EWR', 'IAD', 'JFK', 'LGA', 'PHL', 'PIT'],
  },
  {
    code: 'EURX',
    name: 'Europe',
    airport_codes: [
      'AMS',
      'ARN',
      'ATH',
      'BCN',
      'BER',
      'BRU',
      'CDG',
      'CPH',
      'DUB',
      'EDI',
      'FCO',
      'FRA',
      'GVA',
      'HEL',
      'IST',
      'LGW',
      'LHR',
      'LIS',
      'MAD',
      'MUC',
      'MXP',
      'VIE',
      'WAW',
      'ZRH',
    ],
  },
  {
    code: 'FRAX',
    name: 'France',
    airport_codes: ['CDG', 'LYS', 'MRS', 'NCE', 'ORY', 'TLS'],
  },
  {
    code: 'GERX',
    name: 'Germany',
    airport_codes: ['BER', 'FRA', 'MUC'],
  },
  {
    code: 'HAWX',
    name: 'Hawaii',
    airport_codes: ['HNL', 'KOA', 'LIH', 'OGG'],
  },
  {
    code: 'IBRX',
    name: 'Iberia',
    airport_codes: ['BCN', 'LIS', 'MAD', 'OPO'],
  },
  {
    code: 'IDAX',
    name: 'India',
    airport_codes: ['AMD', 'BLR', 'BOM', 'DEL', 'HYD', 'MAA'],
  },
  {
    code: 'ITAX',
    name: 'Italy',
    airport_codes: ['BLQ', 'FCO', 'LIN', 'MXP', 'NAP', 'VCE'],
  },
  {
    code: 'JPNX',
    name: 'Japan',
    airport_codes: ['HND', 'ITM', 'KIX', 'NRT'],
  },
  {
    code: 'LONX',
    name: 'London, UK',
    airport_codes: ['LCY', 'LGW', 'LHR', 'LTN', 'STN'],
  },
  {
    code: 'QLAX',
    name: 'Los Angeles area',
    airport_codes: ['BUR', 'LAX', 'LGB', 'ONT', 'SNA'],
  },
  {
    code: 'CNAX',
    name: 'Mainland China ',
    airport_codes: ['CAN', 'CKG', 'PEK', 'PKX', 'PVG', 'SZX', 'TFU'],
  },
  {
    code: 'MXCX',
    name: 'Mexico',
    airport_codes: ['CUN', 'GDL', 'MEX', 'MTY', 'PVR', 'SJD'],
  },
  {
    code: 'QMIX',
    name: 'Miami, Florida',
    airport_codes: ['FLL', 'MIA', 'PBI'],
  },
  {
    code: 'MIEX',
    name: 'Middle East',
    airport_codes: ['AMM', 'AUH', 'DOH', 'DXB', 'JED', 'RUH', 'TLV'],
  },
  {
    code: 'MIDX',
    name: 'Midwest, United States',
    airport_codes: ['CLE', 'CVG', 'DTW', 'IND', 'MDW', 'MSP', 'ORD'],
  },
  {
    code: 'NYCX',
    name: 'New York City ',
    airport_codes: ['EWR', 'JFK', 'LGA'],
  },
  {
    code: 'NORX',
    name: 'Nordic/Scandinavian',
    airport_codes: ['ARN', 'CPH', 'HEL', 'OSL'],
  },
  {
    code: 'PKAX',
    name: 'Pakistan',
    airport_codes: ['ISB', 'KHI', 'LHE'],
  },
  {
    code: 'PARX',
    name: 'Paris, France',
    airport_codes: ['CDG', 'ORY'],
  },
  {
    code: 'GBRX',
    name: 'Rest of Great Britain',
    airport_codes: ['BHX', 'GLA', 'MAN'],
  },
  {
    code: 'RUSX',
    name: 'Russia',
    airport_codes: ['DME', 'LED', 'SVO', 'VKO'],
  },
  {
    code: 'QBAX',
    name: 'San Francisco Bay',
    airport_codes: ['OAK', 'SFO', 'SJC'],
  },
  {
    code: 'SELX',
    name: 'Seoul, South Korea',
    airport_codes: ['GMP', 'ICN'],
  },
  {
    code: 'SAMX',
    name: 'South America',
    airport_codes: ['BOG', 'EZE', 'GIG', 'GRU', 'LIM', 'SCL'],
  },
  {
    code: 'SASX',
    name: 'Southeast Asia',
    airport_codes: ['BKK', 'CGK', 'DPS', 'HAN', 'KUL', 'MNL', 'SGN', 'SIN'],
  },
  {
    code: 'TYOX',
    name: 'Tokyo, Japan',
    airport_codes: ['HND', 'NRT'],
  },
  {
    code: 'USAX',
    name: 'United States',
    airport_codes: [
      'ATL',
      'BOS',
      'DEN',
      'DFW',
      'EWR',
      'IAD',
      'IAH',
      'JFK',
      'LAX',
      'MIA',
      'ORD',
      'SEA',
      'SFO',
    ],
  },
  {
    code: 'WASX',
    name: 'Washington, DC Metropolitan Area',
    airport_codes: ['BWI', 'DCA', 'IAD'],
  },
  {
    code: 'WSTX',
    name: 'West Coast, United States',
    airport_codes: ['DEN', 'LAS', 'LAX', 'PDX', 'SAN', 'SEA', 'SFO', 'SJC', 'SLC', 'YVR'],
  },
  {
    code: 'WLDX',
    name: 'World Top Destinations',
    airport_codes: [
      'AMS',
      'ARN',
      'ATL',
      'AUH',
      'BCN',
      'BKK',
      'BOG',
      'BOM',
      'BRU',
      'BUD',
      'CAN',
      'CDG',
      'CLT',
      'CPH',
      'CUN',
      'DEL',
      'DEN',
      'DFW',
      'DME',
      'DOH',
      'DUB',
      'DXB',
      'EWR',
      'EZE',
      'FCO',
      'FRA',
      'GIG',
      'GRU',
      'HEL',
      'HKG',
      'HND',
      'IAH',
      'ICN',
      'IST',
      'JFK',
      'JNB',
      'KUL',
      'LAS',
      'LAX',
      'LED',
      'LGW',
      'LHR',
      'MAD',
      'MCO',
      'MEL',
      'MEX',
      'MIA',
      'MNL',
      'MSP',
      'MUC',
      'MXP',
      'NRT',
      'ORD',
      'OSL',
      'PEK',
      'PHX',
      'PVG',
      'SCL',
      'SEA',
      'SFO',
      'SIN',
      'SJU',
      'STN',
      'SVO',
      'SYD',
      'SZX',
      'YUL',
      'YVR',
      'YYZ',
      'ZRH',
    ],
  },
  {
    code: 'ARCX',
    name: 'Architecture',
    airport_codes: [
      'AMS',
      'ATH',
      'BER',
      'BUD',
      'CAI',
      'CDG',
      'CPT',
      'DUB',
      'EDI',
      'FCO',
      'IST',
      'LGW',
      'LHR',
      'LIS',
      'MAD',
      'PEK',
      'PRG',
      'TLV',
      'VIE',
    ],
  },
  {
    code: 'BCHX',
    name: 'Beach',
    airport_codes: [
      'AUH',
      'BGI',
      'BKK',
      'BNE',
      'CMB',
      'CPT',
      'CUN',
      'DPS',
      'DUR',
      'DXB',
      'GIG',
      'HAV',
      'HKT',
      'HNL',
      'KOA',
      'LAX',
      'LIS',
      'MBJ',
      'MEL',
      'MIA',
      'MLE',
      'NAS',
      'NCE',
      'OGG',
      'PTY',
      'PUJ',
      'SAN',
      'SEZ',
      'SIN',
      'SJU',
      'SYD',
      'ZNZ',
    ],
  },
  {
    code: 'ENTX',
    name: 'Entertainment',
    airport_codes: [
      'AMS',
      'BCN',
      'BER',
      'BUD',
      'CDG',
      'DOH',
      'DXB',
      'EWR',
      'FCO',
      'FRA',
      'HKG',
      'IST',
      'JFK',
      'LAX',
      'LGA',
      'LGW',
      'LHR',
      'MAD',
      'MEX',
      'MUC',
      'PEK',
      'PRG',
      'PVG',
      'SIN',
      'SYD',
      'VIE',
    ],
  },
  {
    code: 'FAMX',
    name: 'Family',
    airport_codes: [
      'AMS',
      'BOS',
      'CDG',
      'CPH',
      'DCA',
      'EWR',
      'FCO',
      'HKG',
      'IAD',
      'ICN',
      'JFK',
      'LAX',
      'LGA',
      'LGW',
      'LHR',
      'MCO',
      'MEX',
      'SAN',
      'SEA',
      'SFO',
      'SIN',
      'SYD',
      'VIE',
      'YUL',
      'YVR',
      'YYZ',
    ],
  },
  {
    code: 'FOOX',
    name: 'Foodie',
    airport_codes: [
      'AMS',
      'ATH',
      'BCN',
      'BKK',
      'BOM',
      'BRU',
      'CDG',
      'CPH',
      'CPT',
      'DEL',
      'DXB',
      'EWR',
      'FCO',
      'FRA',
      'HKG',
      'HND',
      'IST',
      'JFK',
      'LGA',
      'LGW',
      'LHR',
      'LIM',
      'LIS',
      'MAD',
      'MEL',
      'MEX',
      'MUC',
      'NAP',
      'NRT',
      'PEK',
      'PVG',
      'SCL',
      'SFO',
      'SIN',
      'SYD',
      'TLV',
      'VIE',
    ],
  },
  {
    code: 'HISX',
    name: 'History',
    airport_codes: [
      'AMS',
      'ATH',
      'BER',
      'BUD',
      'CAI',
      'CDG',
      'CPT',
      'DUB',
      'EDI',
      'FCO',
      'IST',
      'LGW',
      'LHR',
      'LIS',
      'MAD',
      'PEK',
      'PRG',
      'TLV',
      'VIE',
    ],
  },
  {
    code: 'MNTX',
    name: 'Mountain',
    airport_codes: ['ANC', 'DEN', 'GVA', 'KEF', 'LYS', 'NBO', 'SLC', 'YEG', 'YVR', 'ZRH'],
  },
  {
    code: 'NGTX',
    name: 'Nightlife',
    airport_codes: [
      'AMS',
      'BCN',
      'BER',
      'BKK',
      'BRU',
      'BUD',
      'CDG',
      'CPH',
      'EWR',
      'GIG',
      'HND',
      'JFK',
      'LAS',
      'LAX',
      'LGA',
      'MAD',
      'MIA',
      'NRT',
    ],
  },
  {
    code: 'NPAX',
    name: 'National Park',
    airport_codes: ['ANC', 'DEN', 'HNL', 'JNB', 'KEF', 'LAS', 'NBO', 'PHX', 'SEA', 'SLC', 'YVR'],
  },
  {
    code: 'OTDX',
    name: 'Outdoor',
    airport_codes: [
      'AKL',
      'ANC',
      'BRU',
      'CPH',
      'CPT',
      'DEN',
      'GVA',
      'HEL',
      'JNB',
      'MEL',
      'NBO',
      'OSL',
      'PER',
      'SEA',
      'SLC',
      'SYD',
      'YVR',
      'ZRH',
    ],
  },
  {
    code: 'POPX',
    name: 'Popular',
    airport_codes: ['ATH', 'BCN', 'CDG', 'FCO', 'FRA', 'LHR', 'MAD', 'ZRH'],
  },
  {
    code: 'ROMX',
    name: 'Romantic',
    airport_codes: [
      'BKK',
      'CDG',
      'CUN',
      'DPS',
      'FCO',
      'HKT',
      'HNL',
      'KOA',
      'MLE',
      'PRG',
      'PUJ',
      'SEZ',
      'SYD',
      'VCE',
      'VIE',
    ],
  },
  {
    code: 'SAFX',
    name: 'Safari',
    airport_codes: ['CPT', 'DUR', 'JNB', 'NBO', 'ZNZ'],
  },
  {
    code: 'SHPX',
    name: 'Shopping',
    airport_codes: [
      'AMS',
      'BKK',
      'CDG',
      'CPH',
      'DOH',
      'DXB',
      'EWR',
      'HKG',
      'HND',
      'ICN',
      'IST',
      'JFK',
      'LAX',
      'LGA',
      'LGW',
      'LHR',
      'MAD',
      'MXP',
      'NRT',
      'ORD',
      'PEK',
      'PVG',
      'SIN',
      'ZRH',
    ],
  },
  {
    code: 'SKYX',
    name: 'Sky Scrapper',
    airport_codes: [
      'BKK',
      'CAN',
      'CGK',
      'DOH',
      'DXB',
      'EWR',
      'FRA',
      'HKG',
      'HND',
      'ICN',
      'IST',
      'JFK',
      'KUL',
      'LAX',
      'LGA',
      'LHR',
      'MEL',
      'NRT',
      'ORD',
      'PEK',
      'PVG',
      'SEA',
      'SFO',
      'SIN',
      'SYD',
      'SZX',
      'TPE',
      'YYZ',
    ],
  },
  {
    code: 'TRPX',
    name: 'Tropical',
    airport_codes: [
      'AUA',
      'BGI',
      'BKK',
      'CMB',
      'CUN',
      'DPS',
      'HAV',
      'HKT',
      'HNL',
      'KUL',
      'MBJ',
      'MLE',
      'MNL',
      'NAS',
      'OGG',
      'PTY',
      'PUJ',
      'SEZ',
      'SGN',
      'SIN',
      'SJU',
      'SXM',
      'ZNZ',
    ],
  },
  {
    code: 'WINX',
    name: 'Wine',
    airport_codes: [
      'CDG',
      'CPT',
      'EZE',
      'LIS',
      'LYS',
      'MAD',
      'MEL',
      'NAP',
      'OPO',
      'SCL',
      'SFO',
      'SJC',
    ],
  },
];


// ------------------------------------------------------
// Dialog for displaying 4-letter region codes
// ------------------------------------------------------
interface ShortcutDialogProps {
  open: boolean;
  onClose: () => void;
  data: IAirportShortcut[];
  onSelect: (shortcutCode: string) => void;
  dialogTitle?: string;
}

export function AirportShortcutsDialog({
                                         open,
                                         onClose,
                                         data,
                                         onSelect,
                                         dialogTitle = "Enter ‘ANZX’ to search all major airports in Australia & New Zealand at once—Sydney (SYD), Melbourne (MEL), Brisbane (BNE), Perth (PER), and Auckland (AKL). This shortcut works only for destinations.",
                                       }: ShortcutDialogProps) {
  const handleRowClick = (code: string) => {
    onSelect(code);
    onClose();
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
        <DialogTitle
            sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          <Typography variant="body2">{dialogTitle}</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {isMobile ? (
              <Grid container spacing={2}>
                {data.map((shortcut) => (
                    <Grid item xs={12} key={shortcut.code}>
                      <Box
                          sx={{
                            cursor: "pointer",
                            p: 2,
                            borderRadius: 2,
                            "&:hover": { backgroundColor: "action.hover" },
                          }}
                          onClick={() => handleRowClick(shortcut.code)}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Box
                              sx={{
                                display: "inline-block",
                                backgroundColor: theme.palette.grey[300],
                                borderRadius: 2,
                                px: 1,
                                py: 0.5,
                              }}
                          >
                            <Typography variant="caption" fontWeight="bold">
                              {shortcut.code}
                            </Typography>
                          </Box>
                          <Typography variant="subtitle1" fontWeight="bold">
                            {shortcut.name}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {shortcut.airport_codes.join(", ")}
                        </Typography>
                      </Box>
                    </Grid>
                ))}
              </Grid>
          ) : (
              <MuiTable>
                <MuiTableHead>
                  <MuiTableRow>
                    <MuiTableCell>Code</MuiTableCell>
                    <MuiTableCell>Region</MuiTableCell>
                    <MuiTableCell>Major Airports Included</MuiTableCell>
                  </MuiTableRow>
                </MuiTableHead>
                <MuiTableBody>
                  {data.map((shortcut) => (
                      <MuiTableRow
                          key={shortcut.code}
                          hover
                          sx={{ cursor: "pointer" }}
                          onClick={() => handleRowClick(shortcut.code)}
                      >
                        <MuiTableCell>
                          <Typography variant="body2" fontWeight="bold">
                            {shortcut.code}
                          </Typography>
                        </MuiTableCell>
                        <MuiTableCell>{shortcut.name}</MuiTableCell>
                        <MuiTableCell>{shortcut.airport_codes.join(", ")}</MuiTableCell>
                      </MuiTableRow>
                  ))}
                </MuiTableBody>
              </MuiTable>
          )}
        </DialogContent>
      </Dialog>
  );
}

ChartJS.register(CategoryScale, LinearScale, BarElement, ChartTitle, Tooltip, Legend);

const dbName = "RetreatPlannerDB";
const storeName = "RetreatPlannerStore";

const cabinOptions = [
  { value: "ECONOMY", label: "Economy" },
  { value: "PREMIUM", label: "Premium Economy" },
  { value: "BUSINESS", label: "Business" },
  { value: "FIRST", label: "First" },
];

const stopOptions = [
  { value: "ANY-STOPS", label: "Any stops" },
  { value: "NON-STOP", label: "Non-stop" },
  { value: "ONE-OR-FEWER-STOPS", label: "One or fewer stops" },
  { value: "TWO-OR-FEWER-STOPS", label: "Two or fewer stops" },
];

const layoverOptions = [
  { label: "1", value: 60 },
  { label: "2", value: 120 },
  { label: "3", value: 180 },
  { label: "4", value: 240 },
  { label: "5", value: 300 },
  { label: "6", value: 360 },
  { label: "10", value: 600 },
  { label: "Any", value: 1800 },
];

const barColors = [
  "#FF6384","#36A2EB","#FFCE56","#4BC0C0","#9966FF","#FF9F40","#8B0000","#008000","#00008B","#FFD700",
  "#FFA07A","#20B2AA","#778899","#D2691E","#FF4500","#00FF7F","#4682B4","#C71585","#708090","#FF1493"
];

// Some demo employees
const usAirports = ["JFK", "LAX", "ORD", "ATL", "DFW", "DEN", "SFO", "SEA", "MIA", "BOS"];
const caAirports = ["YYZ", "YVR", "YUL", "YYC"];
const euAirports = ["LHR", "CDG"];
const cabinClasses = ["ECONOMY","ECONOMY","ECONOMY","ECONOMY","ECONOMY","ECONOMY","ECONOMY","BUSINESS","BUSINESS"];

function generateEmployees() {
  const arr: Employee[] = [];
  for (let i = 1; i <= 20; i++) {
    let origin;
    if (i <= 16) {
      origin = usAirports[i % usAirports.length];
    } else if (i <= 19) {
      origin = caAirports[i % caAirports.length];
    } else {
      origin = euAirports[i % euAirports.length];
    }
    arr.push({
      id: `emp${i}`,
      employeeName: `Employee ${i}`,
      origin,
      cabin: cabinClasses[Math.floor(Math.random() * cabinClasses.length)],
      filters: {
        numStops: "ANY-STOPS",
        maxLayover: 600,
        departHourStart: 0,
        departHourEnd: 23,
        arrivalHourStart: 0,
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
  return arr;
}

async function getDB() {
  return openDB(dbName, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName);
      }
    },
  });
}
async function saveToDB(key: string, data: any) {
  const db = await getDB();
  return db.put(storeName, data, key);
}
async function loadFromDB(key: string) {
  const db = await getDB();
  return db.get(storeName, key);
}

export default function RetreatPlanner() {
  const [tripParams, setTripParams] = useState<TripParams>({
    startDate: new Date("2025-07-01"),
    returnDate: new Date("2025-07-31"),
    destinations: ["CUN", "MEX", "NAS", "PTY", "SJD", "AUA", "BJI", "SJU", "STT", "SXM", "STX"],
    minTripLength: 4,
    maxTripLength: 5,
    tripType: "ROUND-TRIP",
  });

  const [employees, setEmployees] = useState<Employee[]>(generateEmployees());
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // For toggling which airports appear in the chart
  const [visibleDestinations, setVisibleDestinations] = useState<string[]>([]);

  // For special-code dialog
  const [showShortcuts, setShowShortcuts] = useState(false);

  // For displaying error about code restrictions
  const [destinationError, setDestinationError] = useState("");
  const [paramError, setParamError] = useState("");

  // Load from IndexedDB on mount
  useEffect(() => {
    (async () => {
      const saved = await loadFromDB("plannerData");
      if (saved) {
        if (saved.tripParams?.startDate) {
          saved.tripParams.startDate = new Date(saved.tripParams.startDate);
        }
        if (saved.tripParams?.returnDate) {
          saved.tripParams.returnDate = new Date(saved.tripParams.returnDate);
        }
        setTripParams(saved.tripParams ?? tripParams);
        setEmployees(saved.employees ?? []);
        setSearchResults(saved.searchResults ?? []);
        setHasSearched(saved.hasSearched ?? false);
      }
    })();
  }, []);

  // Save to IndexedDB whenever state changes
  useEffect(() => {
    const data = { employees, searchResults, hasSearched, tripParams };
    saveToDB("plannerData", data);
  }, [employees, searchResults, hasSearched, tripParams]);

  // Reset visibleDestinations whenever we get new results
  useEffect(() => {
    const uniqueDests = Array.from(new Set(searchResults.map((r) => r.destination)));
    setVisibleDestinations(uniqueDests);
  }, [searchResults]);

  const formatCurrency = (amt: number) =>
      new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amt);

  // ---------------------------------------------------------------------------------
  // Employee management
  // ---------------------------------------------------------------------------------
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
    ]);
  };

  const duplicateEmployee = (emp: Employee) => {
    const clone = JSON.parse(JSON.stringify(emp)) as Employee;
    clone.id = `emp${employees.length + 1}`;
    setEmployees([...employees, clone]);
  };

  const removeEmployee = (id: string) => {
    setEmployees(employees.filter((e) => e.id !== id));
  };

  const updateEmployee = (updated: Employee) => {
    setEmployees(employees.map((e) => (e.id === updated.id ? updated : e)));
  };

  // ---------------------------------------------------------------------------------
  // Destinations
  // ---------------------------------------------------------------------------------
  const [destinationInput, setDestinationInput] = useState("");

  // Restriction rules:
  //  - Up to 20 three-letter codes if no four-letter code is present
  //  - If any four-letter code is present, total code count limited to 2
  //  - Up to 2 four-letter codes total

  const addDestination = () => {
    const code = destinationInput.trim().toUpperCase();
    if (!code) return;

    const isThreeChar = /^[A-Z]{3}$/.test(code);
    const isFourChar = /^[A-Z]{4}$/.test(code);

    if (!isThreeChar && !isFourChar) {
      setDestinationError("Invalid code. Must be 3 or 4 letters.");
      return;
    }
    if (tripParams.destinations.includes(code)) {
      setDestinationError("That code is already added.");
      return;
    }

    const currentDests = tripParams.destinations;
    const fourCount = currentDests.filter((d) => d.length === 4).length;

    // If we are adding a 3-letter code:
    if (isThreeChar) {
      // If any 4-letter code is present, total cannot exceed 2
      if (fourCount > 0) {
        if (currentDests.length >= 2) {
          setDestinationError(
              "Cannot add more codes. If a four-letter code is present, total is limited to 2."
          );
          return;
        }
      } else {
        // No four-letter codes => up to 20 three-letter codes
        const threeCount = currentDests.filter((d) => d.length === 3).length;
        if (threeCount >= 20) {
          setDestinationError("Cannot add more than 20 three-letter codes.");
          return;
        }
      }
    }

    // If we are adding a 4-letter code:
    if (isFourChar) {
      // Up to 2 four-letter codes total
      if (fourCount >= 2) {
        setDestinationError("Cannot add more than 2 four-letter (special) codes.");
        return;
      }
      // If we add a four-letter code, total cannot exceed 2
      if (currentDests.length >= 2) {
        setDestinationError(
            "Cannot add more codes. If a four-letter code is present, total is limited to 2."
        );
        return;
      }
    }

    // Passed all checks
    setTripParams((prev) => ({
      ...prev,
      destinations: [...prev.destinations, code],
    }));
    setDestinationInput("");
    setDestinationError("");
  };

  const removeDestination = (dest: string) => {
    setTripParams((prev) => ({
      ...prev,
      destinations: prev.destinations.filter((d) => d !== dest),
    }));
  };

  // ---------------------------------------------------------------------------------
  // Search
  // ---------------------------------------------------------------------------------
  const handleSearch = async () => {
    setParamError("");

    // 1) Check date difference <= 31 days
    if (tripParams.startDate && tripParams.returnDate) {
      const start = tripParams.startDate.getTime();
      const end = tripParams.returnDate.getTime();
      const daysDiff = Math.floor((end - start) / (1000 * 60 * 60 * 24));
      if (daysDiff > 31) {
        setParamError("Start/End date range cannot exceed 31 days.");
        return;
      }
    }

    // 2) Check minTripLength and maxTripLength difference <= 3
    if (tripParams.maxTripLength - tripParams.minTripLength > 3) {
      setParamError("Min/Max trip length difference cannot exceed 3 days.");
      return;
    }

    if (!tripParams.startDate || !tripParams.returnDate) return;
    setIsLoading(true);

    const formatDate = (d: Date) => d.toISOString().split("T")[0];

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
      minLayover: emp.filters.minLayover || 0,
      totalCarryOnBags: emp.filters.totalCarryOnBags,
      totalCheckedBags: emp.filters.totalCheckedBags,
      emissions: emp.filters.emissions,
      requestLocation: emp.filters.requestLocation,
      avoidUSConnections: emp.filters.avoidUSConnections,
    }));

    const requestData = {
      startDate: formatDate(tripParams.startDate),
      returnDate: formatDate(tripParams.returnDate),
      destinations: tripParams.destinations,
      minTripLength: tripParams.minTripLength,
      maxTripLength: tripParams.maxTripLength,
      tripType: tripParams.tripType,
      employees: employeeRequests,
    };

    try {
      const response = await fetch("https://ret.flyfast.io/analyzeCosts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });
      if (!response.ok) throw new Error("Network Error");

      const data = await response.json();
      setSearchResults(data);
      setSelectedResult(null);
      setHasSearched(true);
    } catch (error) {
      console.error("Error fetching data:", error);
      // fallback
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
      ]);
      setSelectedResult(null);
      setHasSearched(true);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------------------------------------------------------------------------------
  // Handle selected result
  // ---------------------------------------------------------------------------------
  const handleResultSelect = async (res: SearchResult) => {
    await saveToDB("selectedTrip", res);
    const tripId = `${res.destination}-${res.startDate}-${res.returnDate}`.replace(/[^a-zA-Z0-9]/g, "-");
    window.location.href = `/trip/${tripId}`;
  };

  // ---------------------------------------------------------------------------------
  // Chart
  // ---------------------------------------------------------------------------------
  const uniqueDests = Array.from(new Set(searchResults.map((r) => r.destination)));
  const destinationColorMap: Record<string, string> = {};
  let colorIndex = 0;
  for (const d of uniqueDests) {
    destinationColorMap[d] = barColors[colorIndex % barColors.length];
    colorIndex++;
  }

  const toggleDestination = (dest: string) => {
    setVisibleDestinations((prev) =>
        prev.includes(dest) ? prev.filter((x) => x !== dest) : [...prev, dest]
    );
  };

  const filteredResults = searchResults.filter((r) => visibleDestinations.includes(r.destination));

  return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Trip Parameters</CardTitle>
            <CardDescription>Set your travel dates, trip length, etc.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Date Range</Label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {tripParams.startDate ? format(tripParams.startDate, "PPP") : "Start Date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                          mode="single"
                          selected={tripParams.startDate}
                          onSelect={(date) =>
                              setTripParams((prev) => ({
                                ...prev,
                                startDate: date ?? undefined,
                                returnDate:
                                    prev.returnDate && date && prev.returnDate < date
                                        ? undefined
                                        : prev.returnDate,
                              }))
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
                        {tripParams.returnDate ? format(tripParams.returnDate, "PPP") : "Return Date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                          mode="single"
                          selected={tripParams.returnDate}
                          onSelect={(date) =>
                              setTripParams((prev) => ({
                                ...prev,
                                returnDate: date ?? undefined,
                              }))
                          }
                          disabled={(date) =>
                              !tripParams.startDate || (date && date < tripParams.startDate)
                          }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Trip length */}
              <div className="space-y-2">
                <Label>Trip Length (nights)</Label>
                <div className="flex gap-2">
                  <Select
                      value={tripParams.minTripLength.toString()}
                      onValueChange={(val) => {
                        const num = Number(val);
                        setTripParams((prev) => ({
                          ...prev,
                          minTripLength: num,
                          maxTripLength: Math.max(num, prev.maxTripLength),
                        }));
                      }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Min" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => (
                          <SelectItem key={n} value={n.toString()}>
                            {n}
                          </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                      value={tripParams.maxTripLength.toString()}
                      onValueChange={(val) =>
                          setTripParams((prev) => ({
                            ...prev,
                            maxTripLength: Number(val),
                          }))
                      }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Max" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 30 }, (_, i) => i + 1)
                          .filter((n) => n >= tripParams.minTripLength)
                          .map((n) => (
                              <SelectItem key={n} value={n.toString()}>
                                {n}
                              </SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            {paramError && <p className="text-sm text-red-500">{paramError}</p>}
            {/* Destinations */}
            <div className="space-y-2">
              <Label>Potential Destinations</Label>
              <p className="text-sm text-muted-foreground">
                Up to 20 three-letter codes if none are four-letter. If any four-letter code is present,
                total codes are limited to 2 (up to 2 special codes).
              </p>
              <p className="text-sm text-muted-foreground">
                Limitation: No designation as origin of any employee.
              </p>
              <p className="text-sm text-muted-foreground">
                Version 1.0
              </p>
              <div className="flex gap-2">
                <Input
                    value={destinationInput}
                    onChange={(e) => setDestinationInput(e.target.value.toUpperCase().slice(0, 4))}
                    placeholder="E.g. JFK or ANZX"
                    className="uppercase"
                />
                <Button onClick={addDestination} disabled={!destinationInput.trim()}>
                  Add
                </Button>
                <Button variant="outline" onClick={() => setShowShortcuts(true)}>
                  View Special Codes
                </Button>
              </div>

              {destinationError && (
                  <p className="text-sm text-red-500">{destinationError}</p>
              )}

              <div className="flex flex-wrap gap-2 mt-2">
                {tripParams.destinations.map((dest) => (
                    <Badge key={dest} variant="default" className="cursor-pointer">
                      {dest}
                      <X className="ml-1 h-3 w-3" onClick={() => removeDestination(dest)}/>
                    </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                {tripParams.destinations.length} code(s) currently
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
                              onChange={(e) =>
                                  updateEmployee({ ...emp, employeeName: e.target.value })
                              }
                              className="h-8"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                              value={emp.origin}
                              onChange={(e) => {
                                const val = e.target.value.toUpperCase().slice(0, 3);
                                updateEmployee({ ...emp, origin: val });
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
                                  updateEmployee({
                                    ...emp,
                                    filters: { ...emp.filters, numStops: val },
                                  })
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
                                    filters: { ...emp.filters, maxLayover: Number(val) },
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
                                    const hour = Math.max(0, Math.min(23, Number(e.target.value) || 0));
                                    updateEmployee({
                                      ...emp,
                                      filters: { ...emp.filters, arrivalHourStart: hour },
                                    });
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
                                    const hour = Math.max(0, Math.min(23, Number(e.target.value) || 0));
                                    updateEmployee({
                                      ...emp,
                                      filters: { ...emp.filters, arrivalHourEnd: hour },
                                    });
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

              {/* Bar Chart */}
              <TabsContent value="chart">
                <Card>
                  <CardHeader>
                    <CardTitle>Cost Comparison</CardTitle>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {uniqueDests.map((dest) => {
                        const isActive = visibleDestinations.includes(dest);
                        return (
                            <Button
                                key={dest}
                                onClick={() => toggleDestination(dest)}
                                size="sm"
                                style={{
                                  backgroundColor: isActive ? destinationColorMap[dest] : "transparent",
                                  color: isActive ? "#fff" : destinationColorMap[dest],
                                  borderColor: destinationColorMap[dest],
                                }}
                            >
                              {dest}
                            </Button>
                        );
                      })}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Bar
                        data={{
                          labels: filteredResults.map((r) => r.destination),
                          datasets: [
                            {
                              label: "Total Cost",
                              data: filteredResults.map((r) => r.totalCost),
                              backgroundColor: filteredResults.map(
                                  (r) => destinationColorMap[r.destination]
                              ),
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          onClick: (_evt, elements) => {
                            if (elements.length > 0) {
                              const idx = elements[0].index;
                              handleResultSelect(filteredResults[idx]);
                            }
                          },
                          plugins: {
                            tooltip: {
                              callbacks: {
                                label: (ctx) => {
                                  const sr = filteredResults[ctx.dataIndex];
                                  return [
                                    `Cost: ${formatCurrency(sr.totalCost)}`,
                                    `Dates: ${sr.startDate} - ${sr.returnDate}`,
                                  ];
                                },
                                title: (ctx) => {
                                  const sr = filteredResults[ctx[0].dataIndex];
                                  return sr.destination;
                                },
                              },
                            },
                          },
                        }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Search Results List */}
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
                            selectedResult?.returnDate === res.returnDate;
                        const key = `${res.destination}-${res.startDate}-${res.returnDate}-${i}`;
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
                                    For {res.offers.length} employee
                                    {res.offers.length > 1 ? "s" : ""}
                                  </p>
                                </div>
                              </div>
                            </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
        )}

        {/* Special codes dialog */}
        <AirportShortcutsDialog
            open={showShortcuts}
            onClose={() => setShowShortcuts(false)}
            data={airportShortcuts}
            onSelect={(shortcutCode) => {
              setDestinationInput(shortcutCode);
              addDestination();
            }}
        />
      </div>
  );
}