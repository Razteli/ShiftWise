'use client';

import { useState, type FC } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calculator, RotateCcw } from 'lucide-react';
import { Separator } from './ui/separator';

interface Result {
  total: number;
  morning?: number;
  afternoon?: number;
  night?: number;
}

const ResultDisplay: FC<{ result: Result | null; unit: string }> = ({
  result,
  unit,
}) => {
  if (!result) return null;

  return (
    <div className="w-full text-center p-4 bg-primary/10 rounded-lg">
      <h4 className="text-lg font-semibold text-primary">Hasil Perhitungan</h4>
      <p className="text-4xl font-bold mt-2 text-primary">{result.total}</p>
      <p className="text-sm text-muted-foreground">{unit}</p>
      {result.morning !== undefined && (
        <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
          <div>
            <p className="font-semibold">Pagi</p>
            <p className="text-muted-foreground">{result.morning} {unit.toLowerCase()}</p>
          </div>
          <div>
            <p className="font-semibold">Siang</p>
            <p className="text-muted-foreground">{result.afternoon} {unit.toLowerCase()}</p>
          </div>
          <div>
            <p className="font-semibold">Malam</p>
            <p className="text-muted-foreground">{result.night} {unit.toLowerCase()}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const DepkesCalculator = () => {
  const [inputs, setInputs] = useState({ minimal: 0, partial: 0, total: 0 });
  const [result, setResult] = useState<Result | null>(null);

  const handleCalculate = () => {
    const { minimal, partial, total } = inputs;
    // Constants from Depkes RI guidelines
    const hours = { minimal: 2, partial: 3.7, total: 5.4 };
    const workingHoursPerDay = 7;
    const offDayCorrection = 0.25; // 25%

    const totalCareHours =
      minimal * hours.minimal + partial * hours.partial + total * hours.total;
    const baseNurses = totalCareHours / workingHoursPerDay;
    const totalNurses = Math.ceil(baseNurses * (1 + offDayCorrection));

    // Shift distribution ratios
    const distribution = { morning: 0.47, afternoon: 0.36, night: 0.17 };
    setResult({
      total: totalNurses,
      morning: Math.ceil(totalNurses * distribution.morning),
      afternoon: Math.ceil(totalNurses * distribution.afternoon),
      night: Math.ceil(totalNurses * distribution.night),
    });
  };

  const handleReset = () => {
    setInputs({ minimal: 0, partial: 0, total: 0 });
    setResult(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metode Depkes RI (2005)</CardTitle>
        <CardDescription>
          Berdasarkan klasifikasi tingkat ketergantungan pasien.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="depkes-minimal">Pasien Askep Minimal</Label>
          <Input id="depkes-minimal" type="number" value={inputs.minimal} onChange={e => setInputs(i => ({ ...i, minimal: Number(e.target.value) }))} />
        </div>
        <div>
          <Label htmlFor="depkes-partial">Pasien Askep Parsial</Label>
          <Input id="depkes-partial" type="number" value={inputs.partial} onChange={e => setInputs(i => ({ ...i, partial: Number(e.target.value) }))} />
        </div>
        <div>
          <Label htmlFor="depkes-total">Pasien Askep Total</Label>
          <Input id="depkes-total" type="number" value={inputs.total} onChange={e => setInputs(i => ({ ...i, total: Number(e.target.value) }))} />
        </div>
        <div className="flex gap-2 pt-2">
           <Button onClick={handleCalculate} className="w-full"><Calculator />Hitung</Button>
           <Button onClick={handleReset} variant="outline" className="w-full"><RotateCcw/>Reset</Button>
        </div>
      </CardContent>
      <CardFooter>
        <ResultDisplay result={result} unit="Perawat" />
      </CardFooter>
    </Card>
  );
};

const DouglasCalculator = () => {
    const [inputs, setInputs] = useState({ minimal: 0, partial: 0, total: 0 });
    const [result, setResult] = useState<Result | null>(null);

    const handleCalculate = () => {
        const { minimal, partial, total } = inputs;
        // Constants based on Douglas studies
        const hours = { minimal: 2, partial: 3.5, total: 5.5 }; 
        const workingHoursPerDay = 8;

        const totalCareHours = minimal * hours.minimal + partial * hours.partial + total * hours.total;
        const totalNurses = Math.ceil(totalCareHours / workingHoursPerDay);

        // Common shift distribution
        const distribution = { morning: 0.45, afternoon: 0.35, night: 0.20 };
        setResult({
            total: totalNurses,
            morning: Math.ceil(totalNurses * distribution.morning),
            afternoon: Math.ceil(totalNurses * distribution.afternoon),
            night: Math.ceil(totalNurses * distribution.night),
        });
    };

    const handleReset = () => {
        setInputs({ minimal: 0, partial: 0, total: 0 });
        setResult(null);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Metode Douglas (1976)</CardTitle>
                <CardDescription>Berdasarkan klasifikasi pasien dan jam perawatan yang dibutuhkan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="douglas-minimal">Pasien Perawatan Minimal</Label>
                    <Input id="douglas-minimal" type="number" value={inputs.minimal} onChange={e => setInputs(i => ({ ...i, minimal: Number(e.target.value) }))} />
                </div>
                <div>
                    <Label htmlFor="douglas-partial">Pasien Perawatan Parsial</Label>
                    <Input id="douglas-partial" type="number" value={inputs.partial} onChange={e => setInputs(i => ({ ...i, partial: Number(e.target.value) }))} />
                </div>
                <div>
                    <Label htmlFor="douglas-total">Pasien Perawatan Total</Label>
                    <Input id="douglas-total" type="number" value={inputs.total} onChange={e => setInputs(i => ({ ...i, total: Number(e.target.value) }))} />
                </div>
                 <div className="flex gap-2 pt-2">
                    <Button onClick={handleCalculate} className="w-full"><Calculator />Hitung</Button>
                    <Button onClick={handleReset} variant="outline" className="w-full"><RotateCcw/>Reset</Button>
                </div>
            </CardContent>
            <CardFooter>
                <ResultDisplay result={result} unit="Perawat" />
            </CardFooter>
        </Card>
    );
};

const GilliesCalculator = () => {
    const [inputs, setInputs] = useState({
        avgCareHours: 4,
        avgPatients: 20,
        offDays: 86,
        workHours: 7,
        correction: 25,
    });
    const [result, setResult] = useState<Result | null>(null);

    const handleCalculate = () => {
        const { avgCareHours, avgPatients, offDays, workHours, correction } = inputs;
        const A = avgCareHours;
        const B = avgPatients;
        const C = 365;
        const D = offDays;
        const E = workHours;
        const F_percent = correction;

        if ((C - D) * E === 0) {
            setResult({ total: 0 });
            return;
        }

        const baseNurses = (A * B * C) / ((C - D) * E);
        const correctionValue = baseNurses * (F_percent / 100);
        const totalNurses = Math.ceil(baseNurses + correctionValue);

        setResult({ total: totalNurses });
    };

     const handleReset = () => {
        setInputs({ avgCareHours: 4, avgPatients: 20, offDays: 86, workHours: 7, correction: 25 });
        setResult(null);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Metode Gillies (1982)</CardTitle>
                <CardDescription>Formula komprehensif untuk perencanaan kebutuhan staf perawat.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="gillies-care-hours">Rata-rata jam perawatan/pasien/hari</Label>
                        <Input id="gillies-care-hours" type="number" value={inputs.avgCareHours} onChange={e => setInputs(i => ({ ...i, avgCareHours: Number(e.target.value) }))} />
                    </div>
                    <div>
                        <Label htmlFor="gillies-patients">Rata-rata jumlah pasien/hari</Label>
                        <Input id="gillies-patients" type="number" value={inputs.avgPatients} onChange={e => setInputs(i => ({ ...i, avgPatients: Number(e.target.value) }))} />
                    </div>
                    <div>
                        <Label htmlFor="gillies-off-days">Jumlah hari libur/cuti perawat/tahun</Label>
                        <Input id="gillies-off-days" type="number" value={inputs.offDays} onChange={e => setInputs(i => ({ ...i, offDays: Number(e.target.value) }))} />
                    </div>
                     <div>
                        <Label htmlFor="gillies-work-hours">Rata-rata jam kerja perawat/hari</Label>
                        <Input id="gillies-work-hours" type="number" value={inputs.workHours} onChange={e => setInputs(i => ({ ...i, workHours: Number(e.target.value) }))} />
                    </div>
                </div>
                 <div>
                    <Label htmlFor="gillies-correction">Faktor koreksi (non-nursing jobs) (%)</Label>
                    <Input id="gillies-correction" type="number" value={inputs.correction} onChange={e => setInputs(i => ({ ...i, correction: Number(e.target.value) }))} />
                </div>
                 <div className="flex gap-2 pt-2">
                    <Button onClick={handleCalculate} className="w-full"><Calculator />Hitung</Button>
                    <Button onClick={handleReset} variant="outline" className="w-full"><RotateCcw/>Reset</Button>
                </div>
            </CardContent>
            <CardFooter>
                 <ResultDisplay result={result} unit="Perawat" />
            </CardFooter>
        </Card>
    );
};

const OperatingRoomCalculator = () => {
  const [inputs, setInputs] = useState({
    avgOperations: 10,
    avgOperationDuration: 2.5,
    workHours: 7,
    nursesPerTeam: 2,
    correction: 25,
    numberOfRooms: 1,
  });
  const [result, setResult] = useState<Result | null>(null);

  const handleCalculate = () => {
    const {
      avgOperations,
      avgOperationDuration,
      workHours,
      nursesPerTeam,
      correction,
      numberOfRooms,
    } = inputs;

    if (workHours <= 0) {
      setResult({ total: 0 });
      return;
    }

    const totalOperationHours = avgOperations * avgOperationDuration * numberOfRooms;
    const baseNurses = (totalOperationHours / workHours) * nursesPerTeam;
    const totalNursesWithCorrection = baseNurses * (1 + correction / 100);

    setResult({ total: Math.ceil(totalNursesWithCorrection) });
  };

  const handleReset = () => {
    setInputs({
      avgOperations: 10,
      avgOperationDuration: 2.5,
      workHours: 7,
      nursesPerTeam: 2,
      correction: 25,
      numberOfRooms: 1,
    });
    setResult(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metode Kamar Operasi (Koreksi)</CardTitle>
        <CardDescription>
          Berdasarkan jumlah operasi dengan tambahan faktor koreksi.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="op-avg-ops">
              Rata-rata jumlah operasi/kamar/hari
            </Label>
            <Input
              id="op-avg-ops"
              type="number"
              value={inputs.avgOperations}
              onChange={(e) =>
                setInputs((i) => ({ ...i, avgOperations: Number(e.target.value) }))
              }
            />
          </div>
          <div>
            <Label htmlFor="op-avg-duration">
              Rata-rata lama operasi (jam)
            </Label>
            <Input
              id="op-avg-duration"
              type="number"
              value={inputs.avgOperationDuration}
              onChange={(e) =>
                setInputs((i) => ({ ...i, avgOperationDuration: Number(e.target.value) }))
              }
            />
          </div>
          <div>
            <Label htmlFor="op-work-hours">Jam kerja efektif/hari</Label>
            <Input
              id="op-work-hours"
              type="number"
              value={inputs.workHours}
              onChange={(e) =>
                setInputs((i) => ({ ...i, workHours: Number(e.target.value) }))
              }
            />
          </div>
          <div>
            <Label htmlFor="op-nurses-team">
              Jumlah perawat per tim operasi
            </Label>
            <Input
              id="op-nurses-team"
              type="number"
              value={inputs.nursesPerTeam}
              onChange={(e) =>
                setInputs((i) => ({ ...i, nursesPerTeam: Number(e.target.value) }))
              }
            />
          </div>
          <div>
            <Label htmlFor="op-rooms">Jumlah kamar operasi</Label>
            <Input
              id="op-rooms"
              type="number"
              value={inputs.numberOfRooms}
              onChange={(e) =>
                setInputs((i) => ({ ...i, numberOfRooms: Number(e.target.value) }))
              }
            />
          </div>
        </div>
        <div>
          <Label htmlFor="op-correction">Faktor Koreksi (%)</Label>
          <Input
            id="op-correction"
            type="number"
            value={inputs.correction}
            onChange={(e) =>
              setInputs((i) => ({ ...i, correction: Number(e.target.value) }))
            }
          />
           <p className="text-xs text-muted-foreground pt-1">
              Tambahan untuk tugas non-keperawatan, cuti, dll. (mis. 25%)
          </p>
        </div>
        <div className="flex gap-2 pt-2">
          <Button onClick={handleCalculate} className="w-full">
            <Calculator />
            Hitung
          </Button>
          <Button onClick={handleReset} variant="outline" className="w-full">
            <RotateCcw />
            Reset
          </Button>
        </div>
      </CardContent>
      <CardFooter>
        <ResultDisplay result={result} unit="Perawat" />
      </CardFooter>
    </Card>
  );
};


export function NursingCalculator() {
  return (
    <div>
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">
          Kalkulator Kebutuhan Tenaga Perawat
        </h2>
        <p className="text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
          Hitung kebutuhan tenaga perawat di unit Anda menggunakan berbagai
          metode standar.
        </p>
      </div>
      <Tabs defaultValue="depkes" className="w-full max-w-2xl mx-auto">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="depkes">Depkes RI</TabsTrigger>
          <TabsTrigger value="douglas">Douglas</TabsTrigger>
          <TabsTrigger value="gillies">Gillies</TabsTrigger>
          <TabsTrigger value="operating_room">Kamar Operasi</TabsTrigger>
        </TabsList>
        <TabsContent value="depkes">
          <DepkesCalculator />
        </TabsContent>
        <TabsContent value="douglas">
          <DouglasCalculator />
        </TabsContent>
        <TabsContent value="gillies">
          <GilliesCalculator />
        </TabsContent>
        <TabsContent value="operating_room">
          <OperatingRoomCalculator />
        </TabsContent>
      </Tabs>
    </div>
  );
}
