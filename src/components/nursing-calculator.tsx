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
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [inputs, setInputs] = useState({
    minimal: '',
    partial: '',
    total: '',
    offDays: '86',
  });
  const [result, setResult] = useState<Result | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const handleCalculate = () => {
    const minimal = Number(inputs.minimal) || 0;
    const partial = Number(inputs.partial) || 0;
    const total = Number(inputs.total) || 0;
    const offDays = Number(inputs.offDays) || 0;
    
    const hours = { minimal: 2, partial: 3.7, total: 5.4 };
    const workingHoursPerDay = 7;
    const totalDaysInYear = 365;
    const workingDaysInYear = totalDaysInYear - offDays;

    if (workingDaysInYear <= 0) {
      toast({
        title: 'Input Tidak Valid',
        description: 'Jumlah hari libur tidak boleh 365 atau lebih.',
        variant: 'destructive',
      });
      return;
    }

    const totalCareHours =
      minimal * hours.minimal + partial * hours.partial + total * hours.total;

    const baseNurses = totalCareHours / workingHoursPerDay;

    const lossDayCorrectionFactor = totalDaysInYear / workingDaysInYear;

    const totalNursesWithCorrection = baseNurses * lossDayCorrectionFactor;

    const totalNurses = Math.ceil(totalNursesWithCorrection);

    const distribution = { morning: 0.47, afternoon: 0.36, night: 0.17 };
    
    const morningRaw = totalNurses * distribution.morning;
    const afternoonRaw = totalNurses * distribution.afternoon;
    const nightRaw = totalNurses * distribution.night;

    const morningFloor = Math.floor(morningRaw);
    const afternoonFloor = Math.floor(afternoonRaw);
    const nightFloor = Math.floor(nightRaw);

    let remainderToDistribute = totalNurses - (morningFloor + afternoonFloor + nightFloor);

    const remainders = [
      { name: 'morning' as const, value: morningRaw - morningFloor },
      { name: 'afternoon' as const, value: afternoonRaw - afternoonFloor },
      { name: 'night' as const, value: nightRaw - nightFloor },
    ];
    
    remainders.sort((a, b) => b.value - a.value);

    const shiftDistribution = {
      morning: morningFloor,
      afternoon: afternoonFloor,
      night: nightFloor,
    };

    for (let i = 0; i < remainderToDistribute; i++) {
      shiftDistribution[remainders[i].name]++;
    }

    setResult({
      total: totalNurses,
      morning: shiftDistribution.morning,
      afternoon: shiftDistribution.afternoon,
      night: shiftDistribution.night,
    });
    setShowAnalysis(true);
  };

  const handleReset = () => {
    setInputs({ minimal: '', partial: '', total: '', offDays: '86' });
    setResult(null);
    setShowAnalysis(false);
  };

  const minimalVal = Number(inputs.minimal) || 0;
  const partialVal = Number(inputs.partial) || 0;
  const totalVal = Number(inputs.total) || 0;
  const offDaysVal = Number(inputs.offDays) || 0;
  
  const totalCareHours =
    minimalVal * 2 + partialVal * 3.7 + totalVal * 5.4;
  const baseNurses = totalCareHours / 7;
  const workingDaysInYear = 365 - offDaysVal;
  const lossDayCorrectionFactor =
    workingDaysInYear > 0 ? 365 / workingDaysInYear : 0;
  const totalWithCorrection = baseNurses * lossDayCorrectionFactor;

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
          <Input id="depkes-minimal" type="number" placeholder="0" value={inputs.minimal} onChange={e => setInputs(i => ({ ...i, minimal: e.target.value }))} />
        </div>
        <div>
          <Label htmlFor="depkes-partial">Pasien Askep Parsial</Label>
          <Input id="depkes-partial" type="number" placeholder="0" value={inputs.partial} onChange={e => setInputs(i => ({ ...i, partial: e.target.value }))} />
        </div>
        <div>
          <Label htmlFor="depkes-total">Pasien Askep Total</Label>
          <Input id="depkes-total" type="number" placeholder="0" value={inputs.total} onChange={e => setInputs(i => ({ ...i, total: e.target.value }))} />
        </div>
        <div>
          <Label htmlFor="depkes-off-days">Jumlah Hari Libur/Cuti per Tahun</Label>
          <Input id="depkes-off-days" type="number" value={inputs.offDays} onChange={e => setInputs(i => ({ ...i, offDays: e.target.value }))} />
          <p className="text-xs text-muted-foreground pt-1">
            Total hari non-kerja perawat (Contoh: 128 hari = 52x2 akhir pekan + 12 cuti + 12 hari libur nasional).
          </p>
        </div>
        <div className="flex gap-2 pt-2">
           <Button onClick={handleCalculate} className="w-full"><Calculator />Hitung</Button>
           <Button onClick={handleReset} variant="outline" className="w-full"><RotateCcw/>Reset</Button>
        </div>
        {showAnalysis && result && workingDaysInYear > 0 && (
            <div className="mt-4 p-4 border rounded-lg bg-background text-sm space-y-2">
                <h4 className="font-semibold text-primary">Analisa Perhitungan</h4>
                 <p className="text-muted-foreground">
                   1. Total Jam Perawatan: <br/>
                   <span className="font-mono text-foreground text-xs block pl-2">({minimalVal} * 2) + ({partialVal} * 3.7) + ({totalVal} * 5.4) = <b>{totalCareHours.toFixed(2)} jam</b></span>
                 </p>
                 <p className="text-muted-foreground">
                   2. Kebutuhan Dasar Perawat: <br/>
                   <span className="font-mono text-foreground text-xs block pl-2">{totalCareHours.toFixed(2)} / 7 jam = <b>{baseNurses.toFixed(2)} perawat</b></span>
                 </p>
                  <p className="text-muted-foreground">
                   3. Faktor Koreksi "Loss Day": <br/>
                   <span className="font-mono text-foreground text-xs block pl-2">365 / (365 - {offDaysVal}) = <b>{lossDayCorrectionFactor.toFixed(2)}</b></span>
                 </p>
                 <p className="text-muted-foreground">
                   4. Total Kebutuhan (dgn koreksi): <br/>
                   <span className="font-mono text-foreground text-xs block pl-2">{baseNurses.toFixed(2)} * {lossDayCorrectionFactor.toFixed(2)} = {totalWithCorrection.toFixed(2)} &#x2192; <b>{result.total} perawat</b> (dibulatkan)</span>
                 </p>
            </div>
        )}
      </CardContent>
      <CardFooter>
        <ResultDisplay result={result} unit="Perawat" />
      </CardFooter>
    </Card>
  );
};

const DouglasCalculator = () => {
    const [inputs, setInputs] = useState({ minimal: '', partial: '', total: '' });
    const [result, setResult] = useState<Result | null>(null);
    const [showAnalysis, setShowAnalysis] = useState(false);

    const handleCalculate = () => {
        const minimal = Number(inputs.minimal) || 0;
        const partial = Number(inputs.partial) || 0;
        const total = Number(inputs.total) || 0;

        const hours = { minimal: 2, partial: 3.5, total: 5.5 }; 
        const workingHoursPerDay = 8;

        const totalCareHours = minimal * hours.minimal + partial * hours.partial + total * hours.total;
        const totalNurses = Math.ceil(totalCareHours / workingHoursPerDay);

        const distribution = { morning: 0.45, afternoon: 0.35, night: 0.20 };
        
        const morningRaw = totalNurses * distribution.morning;
        const afternoonRaw = totalNurses * distribution.afternoon;
        const nightRaw = totalNurses * distribution.night;

        const morningFloor = Math.floor(morningRaw);
        const afternoonFloor = Math.floor(afternoonRaw);
        const nightFloor = Math.floor(nightRaw);

        let remainderToDistribute = totalNurses - (morningFloor + afternoonFloor + nightFloor);

        const remainders = [
          { name: 'morning' as const, value: morningRaw - morningFloor },
          { name: 'afternoon' as const, value: afternoonRaw - afternoonFloor },
          { name: 'night' as const, value: nightRaw - nightFloor },
        ];
        
        remainders.sort((a, b) => b.value - a.value);

        const shiftDistribution = {
          morning: morningFloor,
          afternoon: afternoonFloor,
          night: nightFloor,
        };

        for (let i = 0; i < remainderToDistribute; i++) {
          shiftDistribution[remainders[i].name]++;
        }

        setResult({
            total: totalNurses,
            morning: shiftDistribution.morning,
            afternoon: shiftDistribution.afternoon,
            night: shiftDistribution.night,
        });
        setShowAnalysis(true);
    };

    const handleReset = () => {
        setInputs({ minimal: '', partial: '', total: '' });
        setResult(null);
        setShowAnalysis(false);
    };

    const minimalVal = Number(inputs.minimal) || 0;
    const partialVal = Number(inputs.partial) || 0;
    const totalVal = Number(inputs.total) || 0;
    const totalCareHours = minimalVal * 2 + partialVal * 3.5 + totalVal * 5.5;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Metode Douglas (1976)</CardTitle>
                <CardDescription>Berdasarkan klasifikasi pasien dan jam perawatan yang dibutuhkan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <Label htmlFor="douglas-minimal">Pasien Perawatan Minimal</Label>
                    <Input id="douglas-minimal" type="number" placeholder="0" value={inputs.minimal} onChange={e => setInputs(i => ({ ...i, minimal: e.target.value }))} />
                </div>
                <div>
                    <Label htmlFor="douglas-partial">Pasien Perawatan Parsial</Label>
                    <Input id="douglas-partial" type="number" placeholder="0" value={inputs.partial} onChange={e => setInputs(i => ({ ...i, partial: e.target.value }))} />
                </div>
                <div>
                    <Label htmlFor="douglas-total">Pasien Perawatan Total</Label>
                    <Input id="douglas-total" type="number" placeholder="0" value={inputs.total} onChange={e => setInputs(i => ({ ...i, total: e.target.value }))} />
                </div>
                 <div className="flex gap-2 pt-2">
                    <Button onClick={handleCalculate} className="w-full"><Calculator />Hitung</Button>
                    <Button onClick={handleReset} variant="outline" className="w-full"><RotateCcw/>Reset</Button>
                </div>
                {showAnalysis && result && (
                    <div className="mt-4 p-4 border rounded-lg bg-background text-sm space-y-2">
                        <h4 className="font-semibold text-primary">Analisa Perhitungan</h4>
                         <p className="text-muted-foreground">
                           1. Total Jam Perawatan: <br/>
                           <span className="font-mono text-foreground text-xs block pl-2">({minimalVal} * 2) + ({partialVal} * 3.5) + ({totalVal} * 5.5) = <b>{totalCareHours.toFixed(2)} jam</b></span>
                         </p>
                         <p className="text-muted-foreground">
                           2. Kebutuhan Perawat: <br/>
                           <span className="font-mono text-foreground text-xs block pl-2">{totalCareHours.toFixed(2)} / 8 jam = {(totalCareHours / 8).toFixed(2)} &#x2192; <b>{result.total} perawat</b> (dibulatkan)</span>
                         </p>
                    </div>
                )}
            </CardContent>
            <CardFooter>
                <ResultDisplay result={result} unit="Perawat" />
            </CardFooter>
        </Card>
    );
};

const GilliesCalculator = () => {
    const [inputs, setInputs] = useState({
        avgCareHours: '4',
        avgPatients: '20',
        offDays: '86',
        workHours: '7',
        correction: '25',
    });
    const [result, setResult] = useState<Result | null>(null);
    const [showAnalysis, setShowAnalysis] = useState(false);

    const handleCalculate = () => {
        const avgCareHours = Number(inputs.avgCareHours) || 0;
        const avgPatients = Number(inputs.avgPatients) || 0;
        const offDays = Number(inputs.offDays) || 0;
        const workHours = Number(inputs.workHours) || 0;
        const correction = Number(inputs.correction) || 0;

        const A = avgCareHours;
        const B = avgPatients;
        const C = 365;
        const D = offDays;
        const E = workHours;
        const F_percent = correction;

        if ((C - D) * E === 0) {
            setResult({ total: 0 });
            setShowAnalysis(true);
            return;
        }

        const baseNurses = (A * B * C) / ((C - D) * E);
        const correctionValue = baseNurses * (F_percent / 100);
        const totalNurses = Math.ceil(baseNurses + correctionValue);

        setResult({ total: totalNurses });
        setShowAnalysis(true);
    };

     const handleReset = () => {
        setInputs({ avgCareHours: '4', avgPatients: '20', offDays: '86', workHours: '7', correction: '25' });
        setResult(null);
        setShowAnalysis(false);
    };

    const avgCareHoursVal = Number(inputs.avgCareHours) || 0;
    const avgPatientsVal = Number(inputs.avgPatients) || 0;
    const offDaysVal = Number(inputs.offDays) || 0;
    const workHoursVal = Number(inputs.workHours) || 0;
    const correctionVal = Number(inputs.correction) || 0;

    const baseNurses = ((avgCareHoursVal * avgPatientsVal * 365) / ((365 - offDaysVal) * workHoursVal));
    const correctionValue = baseNurses * (correctionVal / 100);

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
                        <Input id="gillies-care-hours" type="number" value={inputs.avgCareHours} onChange={e => setInputs(i => ({ ...i, avgCareHours: e.target.value }))} />
                    </div>
                    <div>
                        <Label htmlFor="gillies-patients">Rata-rata jumlah pasien/hari</Label>
                        <Input id="gillies-patients" type="number" value={inputs.avgPatients} onChange={e => setInputs(i => ({ ...i, avgPatients: e.target.value }))} />
                    </div>
                    <div>
                        <Label htmlFor="gillies-off-days">Jumlah hari libur/cuti perawat/tahun</Label>
                        <Input id="gillies-off-days" type="number" value={inputs.offDays} onChange={e => setInputs(i => ({ ...i, offDays: e.target.value }))} />
                    </div>
                     <div>
                        <Label htmlFor="gillies-work-hours">Rata-rata jam kerja perawat/hari</Label>
                        <Input id="gillies-work-hours" type="number" value={inputs.workHours} onChange={e => setInputs(i => ({ ...i, workHours: e.target.value }))} />
                    </div>
                </div>
                 <div>
                    <Label htmlFor="gillies-correction">Faktor koreksi (non-nursing jobs) (%)</Label>
                    <Input id="gillies-correction" type="number" value={inputs.correction} onChange={e => setInputs(i => ({ ...i, correction: e.target.value }))} />
                </div>
                 <div className="flex gap-2 pt-2">
                    <Button onClick={handleCalculate} className="w-full"><Calculator />Hitung</Button>
                    <Button onClick={handleReset} variant="outline" className="w-full"><RotateCcw/>Reset</Button>
                </div>
                 {showAnalysis && result && (
                    <div className="mt-4 p-4 border rounded-lg bg-background text-sm space-y-2">
                        <h4 className="font-semibold text-primary">Analisa Perhitungan</h4>
                        <p className="text-muted-foreground">
                            1. Kebutuhan Dasar Perawat: <br/>
                            <span className="font-mono text-foreground text-xs block pl-2">({avgCareHoursVal} * {avgPatientsVal} * 365) / ((365 - {offDaysVal}) * {workHoursVal}) = <b>{isFinite(baseNurses) ? baseNurses.toFixed(2) : 0} perawat</b></span>
                        </p>
                        <p className="text-muted-foreground">
                           2. Nilai Koreksi ({correctionVal}%): <br/>
                           <span className="font-mono text-foreground text-xs block pl-2">{isFinite(baseNurses) ? baseNurses.toFixed(2) : 0} * {correctionVal / 100} = <b>{isFinite(correctionValue) ? correctionValue.toFixed(2) : 0} perawat</b></span>
                        </p>
                        <p className="text-muted-foreground">
                            3. Total Kebutuhan: <br/>
                            <span className="font-mono text-foreground text-xs block pl-2">{isFinite(baseNurses) ? baseNurses.toFixed(2) : 0} + {isFinite(correctionValue) ? correctionValue.toFixed(2) : 0} = {(isFinite(baseNurses) && isFinite(correctionValue) ? baseNurses + correctionValue : 0).toFixed(2)} &#x2192; <b>{result.total} perawat</b> (dibulatkan)</span>
                        </p>
                    </div>
                 )}
            </CardContent>
            <CardFooter>
                 <ResultDisplay result={result} unit="Perawat" />
            </CardFooter>
        </Card>
    );
};

const OperatingRoomCalculator = () => {
  const { toast } = useToast();
  const [inputs, setInputs] = useState({
    largeOpsCount: '2',
    largeOpsHours: '5',
    largeOpsNurses: '4',
    mediumOpsCount: '4',
    mediumOpsHours: '2.5',
    mediumOpsNurses: '3',
    smallOpsCount: '4',
    smallOpsHours: '1',
    smallOpsNurses: '2',
    workHours: '7',
    correction: '25',
    numberOfRooms: '1',
  });
  const [result, setResult] = useState<Result | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const handleCalculate = () => {
    const largeOpsCount = Number(inputs.largeOpsCount) || 0;
    const largeOpsHours = Number(inputs.largeOpsHours) || 0;
    const largeOpsNurses = Number(inputs.largeOpsNurses) || 0;
    const mediumOpsCount = Number(inputs.mediumOpsCount) || 0;
    const mediumOpsHours = Number(inputs.mediumOpsHours) || 0;
    const mediumOpsNurses = Number(inputs.mediumOpsNurses) || 0;
    const smallOpsCount = Number(inputs.smallOpsCount) || 0;
    const smallOpsHours = Number(inputs.smallOpsHours) || 0;
    const smallOpsNurses = Number(inputs.smallOpsNurses) || 0;
    const workHours = Number(inputs.workHours) || 0;
    const correction = Number(inputs.correction) || 0;
    const numberOfRooms = Number(inputs.numberOfRooms) || 0;

    if (workHours <= 0) {
       toast({
        title: 'Input Tidak Valid',
        description: 'Jam kerja efektif harus lebih dari 0.',
        variant: 'destructive',
      });
      return;
    }

    const totalLargeOpsHours = largeOpsCount * largeOpsHours * largeOpsNurses;
    const totalMediumOpsHours = mediumOpsCount * mediumOpsHours * mediumOpsNurses;
    const totalSmallOpsHours = smallOpsCount * smallOpsHours * smallOpsNurses;

    const totalNurseHours = (totalLargeOpsHours + totalMediumOpsHours + totalSmallOpsHours) * numberOfRooms;

    const baseNurses = totalNurseHours / workHours;
    const totalNursesWithCorrection = baseNurses * (1 + correction / 100);

    setResult({ total: Math.ceil(totalNursesWithCorrection) });
    setShowAnalysis(true);
  };

  const handleReset = () => {
    setInputs({
      largeOpsCount: '2', largeOpsHours: '5', largeOpsNurses: '4',
      mediumOpsCount: '4', mediumOpsHours: '2.5', mediumOpsNurses: '3',
      smallOpsCount: '4', smallOpsHours: '1', smallOpsNurses: '2',
      workHours: '7', correction: '25', numberOfRooms: '1',
    });
    setResult(null);
    setShowAnalysis(false);
  };

  const largeOpsCountVal = Number(inputs.largeOpsCount) || 0;
  const largeOpsHoursVal = Number(inputs.largeOpsHours) || 0;
  const largeOpsNursesVal = Number(inputs.largeOpsNurses) || 0;
  const mediumOpsCountVal = Number(inputs.mediumOpsCount) || 0;
  const mediumOpsHoursVal = Number(inputs.mediumOpsHours) || 0;
  const mediumOpsNursesVal = Number(inputs.mediumOpsNurses) || 0;
  const smallOpsCountVal = Number(inputs.smallOpsCount) || 0;
  const smallOpsHoursVal = Number(inputs.smallOpsHours) || 0;
  const smallOpsNursesVal = Number(inputs.smallOpsNurses) || 0;
  const workHoursVal = Number(inputs.workHours) || 0;
  const correctionVal = Number(inputs.correction) || 0;
  const numberOfRoomsVal = Number(inputs.numberOfRooms) || 0;
  
  const totalLargeOpsHours = largeOpsCountVal * largeOpsHoursVal * largeOpsNursesVal;
  const totalMediumOpsHours = mediumOpsCountVal * mediumOpsHoursVal * mediumOpsNursesVal;
  const totalSmallOpsHours = smallOpsCountVal * smallOpsHoursVal * smallOpsNursesVal;
  const totalNurseHours = (totalLargeOpsHours + totalMediumOpsHours + totalSmallOpsHours) * numberOfRoomsVal;
  const baseNurses = workHoursVal > 0 ? totalNurseHours / workHoursVal : 0;
  const totalNursesWithCorrection = baseNurses * (1 + correctionVal / 100);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metode Kamar Operasi (Detail)</CardTitle>
        <CardDescription>
          Berdasarkan jenis operasi, durasi, dan jumlah tim perawat.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Operation Types */}
        <div className="space-y-4 rounded-md border p-4">
          <h4 className="font-semibold text-sm text-primary">Operasi Besar</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div><Label>Jumlah/hari</Label><Input type="number" value={inputs.largeOpsCount} onChange={e => setInputs(i => ({...i, largeOpsCount: e.target.value}))} /></div>
            <div><Label>Lama (jam)</Label><Input type="number" value={inputs.largeOpsHours} onChange={e => setInputs(i => ({...i, largeOpsHours: e.target.value}))} /></div>
            <div><Label>Jml Perawat</Label><Input type="number" value={inputs.largeOpsNurses} onChange={e => setInputs(i => ({...i, largeOpsNurses: e.target.value}))} /></div>
          </div>
        </div>
        <div className="space-y-4 rounded-md border p-4">
           <h4 className="font-semibold text-sm text-primary">Operasi Sedang</h4>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
             <div><Label>Jumlah/hari</Label><Input type="number" value={inputs.mediumOpsCount} onChange={e => setInputs(i => ({...i, mediumOpsCount: e.target.value}))} /></div>
             <div><Label>Lama (jam)</Label><Input type="number" value={inputs.mediumOpsHours} onChange={e => setInputs(i => ({...i, mediumOpsHours: e.target.value}))} /></div>
             <div><Label>Jml Perawat</Label><Input type="number" value={inputs.mediumOpsNurses} onChange={e => setInputs(i => ({...i, mediumOpsNurses: e.target.value}))} /></div>
           </div>
        </div>
        <div className="space-y-4 rounded-md border p-4">
            <h4 className="font-semibold text-sm text-primary">Operasi Kecil</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
             <div><Label>Jumlah/hari</Label><Input type="number" value={inputs.smallOpsCount} onChange={e => setInputs(i => ({...i, smallOpsCount: e.target.value}))} /></div>
             <div><Label>Lama (jam)</Label><Input type="number" value={inputs.smallOpsHours} onChange={e => setInputs(i => ({...i, smallOpsHours: e.target.value}))} /></div>
             <div><Label>Jml Perawat</Label><Input type="number" value={inputs.smallOpsNurses} onChange={e => setInputs(i => ({...i, smallOpsNurses: e.target.value}))} /></div>
           </div>
        </div>
        
        {/* Other Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
           <div>
            <Label htmlFor="op-work-hours">Jam kerja efektif/hari</Label>
            <Input id="op-work-hours" type="number" value={inputs.workHours} onChange={e => setInputs(i => ({ ...i, workHours: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="op-rooms">Jumlah kamar operasi</Label>
            <Input id="op-rooms" type="number" value={inputs.numberOfRooms} onChange={e => setInputs(i => ({ ...i, numberOfRooms: e.target.value }))} />
          </div>
          <div>
            <Label htmlFor="op-correction">Faktor Koreksi (%)</Label>
            <Input id="op-correction" type="number" value={inputs.correction} onChange={e => setInputs(i => ({ ...i, correction: e.target.value }))} />
          </div>
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
         {showAnalysis && result && workHoursVal > 0 && (
            <div className="mt-4 p-4 border rounded-lg bg-background text-sm space-y-2">
                <h4 className="font-semibold text-primary">Analisa Perhitungan</h4>
                <p className="text-muted-foreground">
                    1. Total Jam-Perawat/hari: <br/>
                    <span className="font-mono text-foreground text-xs block pl-2">
                        Besar: ({largeOpsCountVal}*{largeOpsHoursVal}*{largeOpsNursesVal}) = {totalLargeOpsHours.toFixed(1)} <br/>
                        Sedang: ({mediumOpsCountVal}*{mediumOpsHoursVal}*{mediumOpsNursesVal}) = {totalMediumOpsHours.toFixed(1)} <br/>
                        Kecil: ({smallOpsCountVal}*{smallOpsHoursVal}*{smallOpsNursesVal}) = {totalSmallOpsHours.toFixed(1)} <br/>
                        Subtotal * {numberOfRoomsVal} Kamar = <b>{totalNurseHours.toFixed(1)} jam-perawat</b>
                    </span>
                </p>
                <p className="text-muted-foreground">
                    2. Kebutuhan Dasar Perawat: <br/>
                    <span className="font-mono text-foreground text-xs block pl-2">{totalNurseHours.toFixed(1)} jam-perawat / {workHoursVal} jam kerja = <b>{baseNurses.toFixed(2)} perawat</b></span>
                </p>
                <p className="text-muted-foreground">
                    3. Total (dgn koreksi {correctionVal}%): <br/>
                    <span className="font-mono text-foreground text-xs block pl-2">{baseNurses.toFixed(2)} * (1 + {correctionVal / 100}) = {totalNursesWithCorrection.toFixed(2)} &#x2192; <b>{result.total} perawat</b> (dibulatkan)</span>
                </p>
            </div>
         )}
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
