
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
import { Calculator, RotateCcw, Plus, Trash, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from './ui/badge';
import Link from 'next/link';

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
    sedang: '',
    agakBerat: '',
    maksimal: '',
    offDays: '86',
  });
  const [result, setResult] = useState<Result | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);

  const handleCalculate = () => {
    const minimal = Number(inputs.minimal) || 0;
    const sedang = Number(inputs.sedang) || 0;
    const agakBerat = Number(inputs.agakBerat) || 0;
    const maksimal = Number(inputs.maksimal) || 0;
    const offDays = Number(inputs.offDays) || 0;

    const hours = { minimal: 2, sedang: 3.08, agakBerat: 4.15, maksimal: 6.16 };
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
      minimal * hours.minimal +
      sedang * hours.sedang +
      agakBerat * hours.agakBerat +
      maksimal * hours.maksimal;

    const baseNurses = totalCareHours / workingHoursPerDay;
    const lossDayCorrectionFactor = totalDaysInYear / workingDaysInYear;
    const totalNursesWithCorrection = baseNurses * lossDayCorrectionFactor;
    const totalNurses = Math.ceil(totalNursesWithCorrection);

    setResult({
      total: totalNurses,
    });
    setShowAnalysis(true);
  };

  const handleReset = () => {
    setInputs({ minimal: '', sedang: '', agakBerat: '', maksimal: '', offDays: '86' });
    setResult(null);
    setShowAnalysis(false);
  };

  const minimalVal = Number(inputs.minimal) || 0;
  const sedangVal = Number(inputs.sedang) || 0;
  const agakBeratVal = Number(inputs.agakBerat) || 0;
  const maksimalVal = Number(inputs.maksimal) || 0;
  const offDaysVal = Number(inputs.offDays) || 0;
  
  const totalCareHours =
    minimalVal * 2 + sedangVal * 3.08 + agakBeratVal * 4.15 + maksimalVal * 6.16;
  const baseNurses = totalCareHours / 7;
  const workingDaysInYear = 365 - offDaysVal;
  const lossDayCorrectionFactor =
    workingDaysInYear > 0 ? 365 / workingDaysInYear : 0;
  const totalWithCorrection = baseNurses * lossDayCorrectionFactor;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metode Depkes RI (Revisi)</CardTitle>
        <CardDescription>
          Berdasarkan klasifikasi tingkat ketergantungan pasien yang diperbarui.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="depkes-minimal">Pasien Asuhan Keperawatan Minimal</Label>
          <Input id="depkes-minimal" type="number" placeholder="0" value={inputs.minimal} onChange={e => setInputs(i => ({ ...i, minimal: e.target.value }))} />
        </div>
        <div>
          <Label htmlFor="depkes-sedang">Pasien Asuhan Keperawatan Sedang</Label>
          <Input id="depkes-sedang" type="number" placeholder="0" value={inputs.sedang} onChange={e => setInputs(i => ({ ...i, sedang: e.target.value }))} />
        </div>
        <div>
          <Label htmlFor="depkes-agak-berat">Pasien Asuhan Keperawatan Agak Berat</Label>
          <Input id="depkes-agak-berat" type="number" placeholder="0" value={inputs.agakBerat} onChange={e => setInputs(i => ({ ...i, agakBerat: e.target.value }))} />
        </div>
         <div>
          <Label htmlFor="depkes-maksimal">Pasien Asuhan Keperawatan Maksimal</Label>
          <Input id="depkes-maksimal" type="number" placeholder="0" value={inputs.maksimal} onChange={e => setInputs(i => ({ ...i, maksimal: e.target.value }))} />
        </div>
        <div>
          <Label htmlFor="depkes-off-days">Jumlah Hari Libur/Cuti per Tahun</Label>
          <Input id="depkes-off-days" type="number" value={inputs.offDays} onChange={e => setInputs(i => ({ ...i, offDays: e.target.value }))} />
          <p className="text-xs text-muted-foreground pt-1">
            Total hari non-kerja perawat (Contoh: 128 hari = 52x2 akhir pekan + 12 cuti + 12 hari libur nasional).
          </p>
        </div>
        <Accordion type="single" collapsible className="w-full pt-2">
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-sm font-normal py-2">
              Lihat Petunjuk Kriteria Klasifikasi Pasien
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-xs text-muted-foreground pb-2">
                Gunakan tabel referensi ini untuk membantu menentukan jumlah
                pasien di setiap kategori.
              </p>
              <Table className="text-xs border">
                <TableHeader>
                  <TableRow>
                    <TableHead>Klasifikasi</TableHead>
                    <TableHead>Kriteria Pasien</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Minimal</TableCell>
                    <TableCell>
                      Pasien bisa melakukan perawatan diri (makan, minum,
                      kebersihan) secara mandiri atau dengan sedikit bantuan.
                      Ambulasi dengan pengawasan. Observasi TTV setiap shift.
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Sedang</TableCell>
                    <TableCell>
                      Pasien memerlukan bantuan sedang untuk aktivitas harian.
                      Terpasang infus atau drain. Ambulasi dibantu. Observasi
                      TTV setiap 4 jam.
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Agak Berat</TableCell>
                    <TableCell>
                      Pasien memerlukan bantuan penuh untuk aktivitas harian.
                      Kesadaran bisa menurun atau gelisah. Terpasang kateter
                      urin atau NGT. Observasi TTV setiap 2-4 jam.
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Maksimal</TableCell>
                    <TableCell>
                      Pasien dalam kondisi kritis dan sangat bergantung pada
                      perawat. Seringkali tidak sadar atau menggunakan alat bantu
                      hidup (ventilator). Observasi TTV &lt; 2 jam sekali.
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <div className="flex gap-2 pt-2">
           <Button onClick={handleCalculate} className="w-full"><Calculator />Hitung</Button>
           <Button onClick={handleReset} variant="outline" className="w-full"><RotateCcw/>Reset</Button>
        </div>
        {showAnalysis && result && workingDaysInYear > 0 && (
            <div className="mt-4 p-4 border rounded-lg bg-background text-sm space-y-2">
                <h4 className="font-semibold text-primary">Analisa Perhitungan</h4>
                 <p className="text-muted-foreground">
                   1. Total Jam Perawatan: <br/>
                   <span className="font-mono text-foreground text-xs block pl-2">({minimalVal}*2) + ({sedangVal}*3.08) + ({agakBeratVal}*4.15) + ({maksimalVal}*6.16) = <b>{totalCareHours.toFixed(2)} jam</b></span>
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
                <Accordion type="single" collapsible className="w-full pt-2">
                  <AccordionItem value="item-1">
                    <AccordionTrigger className="text-sm font-normal py-2">
                      Lihat Petunjuk Penentuan Jam Perawatan (Depkes RI)
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-xs text-muted-foreground pb-2">
                        Gunakan tabel referensi ini untuk membantu menentukan
                        nilai &quot;Rata-rata jam perawatan per pasien&quot;.
                      </p>
                      <Table className="text-xs border">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Klasifikasi</TableHead>
                            <TableHead>Kriteria Pasien</TableHead>
                            <TableHead className="text-right">
                              Jam/24 jam
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Minimal</TableCell>
                            <TableCell>
                              Bisa mandiri (kebersihan, makan, ambulasi),
                              observasi TTV per shift.
                            </TableCell>
                            <TableCell className="text-right">1-2 jam</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Parsial</TableCell>
                            <TableCell>
                              Perlu bantuan (kebersihan, makan), observasi TTV
                              per 4 jam, terapi IV.
                            </TableCell>
                            <TableCell className="text-right">3-4 jam</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Total</TableCell>
                            <TableCell>
                              Tergantung total, posisi diatur, observasi TTV per
                              2 jam, pakai ventilator.
                            </TableCell>
                            <TableCell className="text-right">5-6 jam</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
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
    offDays: '86',
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
    const offDays = Number(inputs.offDays) || 0;

    if (workHours <= 0) {
      toast({
        title: 'Input Tidak Valid',
        description: 'Jam kerja efektif harus lebih dari 0.',
        variant: 'destructive',
      });
      return;
    }
    
    if (offDays >= 365) {
      toast({
        title: 'Input Tidak Valid',
        description: 'Jumlah hari libur tidak boleh 365 atau lebih.',
        variant: 'destructive',
      });
      return;
    }

    const totalLargeOpsHours = largeOpsCount * largeOpsHours * largeOpsNurses;
    const totalMediumOpsHours =
      mediumOpsCount * mediumOpsHours * mediumOpsNurses;
    const totalSmallOpsHours = smallOpsCount * smallOpsHours * smallOpsNurses;

    const totalNurseHours =
      totalLargeOpsHours + totalMediumOpsHours + totalSmallOpsHours;

    const baseNurses = totalNurseHours / workHours;
    const lossDayFactor = 365 / (365 - offDays);
    const totalNursesWithCorrection = baseNurses * lossDayFactor;

    setResult({ total: Math.ceil(totalNursesWithCorrection) });
    setShowAnalysis(true);
  };

  const handleReset = () => {
    setInputs({
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
      offDays: '86',
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
  const offDaysVal = Number(inputs.offDays) || 0;

  const totalLargeOpsHours =
    largeOpsCountVal * largeOpsHoursVal * largeOpsNursesVal;
  const totalMediumOpsHours =
    mediumOpsCountVal * mediumOpsHoursVal * mediumOpsNursesVal;
  const totalSmallOpsHours =
    smallOpsCountVal * smallOpsHoursVal * smallOpsNursesVal;
  const totalNurseHours =
    totalLargeOpsHours + totalMediumOpsHours + totalSmallOpsHours;
  const baseNurses = workHoursVal > 0 ? totalNurseHours / workHoursVal : 0;
  const lossDayFactor = 365 - offDaysVal > 0 ? 365 / (365 - offDaysVal) : 0;
  const totalWithCorrection = baseNurses * lossDayFactor;

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
          <div>
            <Label htmlFor="op-work-hours">Jam kerja efektif/hari</Label>
            <Input id="op-work-hours" type="number" value={inputs.workHours} onChange={e => setInputs(i => ({...i, workHours: e.target.value}))} />
          </div>
          <div>
            <Label htmlFor="op-off-days">
              Jumlah hari libur/cuti per tahun
            </Label>
            <Input id="op-off-days" type="number" value={inputs.offDays} onChange={e => setInputs(i => ({...i, offDays: e.target.value}))} />
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
        {showAnalysis &&
          result &&
          workHoursVal > 0 &&
          365 - offDaysVal > 0 && (
            <div className="mt-4 p-4 border rounded-lg bg-background text-sm space-y-2">
              <h4 className="font-semibold text-primary">
                Analisa Perhitungan
              </h4>
              <p className="text-muted-foreground">
                1. Total Jam-Perawat/hari: <br />
                <span className="font-mono text-foreground text-xs block pl-2">
                  Besar: ({largeOpsCountVal}*{largeOpsHoursVal}*
                  {largeOpsNursesVal}) = {totalLargeOpsHours.toFixed(1)} <br />
                  Sedang: ({mediumOpsCountVal}*{mediumOpsHoursVal}*
                  {mediumOpsNursesVal}) = {totalMediumOpsHours.toFixed(1)}{' '}
                  <br />
                  Kecil: ({smallOpsCountVal}*{smallOpsHoursVal}*
                  {smallOpsNursesVal}) = {totalSmallOpsHours.toFixed(1)} <br />
                  Total = <b>{totalNurseHours.toFixed(1)} jam-perawat</b>
                </span>
              </p>
              <p className="text-muted-foreground">
                2. Kebutuhan Dasar Perawat: <br />
                <span className="font-mono text-foreground text-xs block pl-2">
                  {totalNurseHours.toFixed(1)} jam-perawat / {workHoursVal} jam
                  kerja = <b>{baseNurses.toFixed(2)} perawat</b>
                </span>
              </p>
              <p className="text-muted-foreground">
                3. Faktor Koreksi &quot;Loss Day&quot;: <br />
                <span className="font-mono text-foreground text-xs block pl-2">
                  365 / (365 - {offDaysVal}) ={' '}
                  <b>{lossDayFactor.toFixed(2)}</b>
                </span>
              </p>
              <p className="text-muted-foreground">
                4. Total Kebutuhan (dgn koreksi): <br />
                <span className="font-mono text-foreground text-xs block pl-2">
                  {baseNurses.toFixed(2)} * {lossDayFactor.toFixed(2)} ={' '}
                  {totalWithCorrection.toFixed(2)} &#x2192;{' '}
                  <b>{result.total} perawat</b> (dibulatkan)
                </span>
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

interface Activity {
  id: number;
  name: string;
  count: string;
  time: string;
}

const WISNCalculator = () => {
  const [inputs, setInputs] = useState({
    workDaysPerYear: '260',
    nonWorkDaysPerYear: '86',
    hoursPerWorkDay: '7',
    indirectCareMinutesPerDay: '60',
  });
  
  const [activities, setActivities] = useState<Activity[]>([
    { id: 1, name: 'Asuhan Pasien Minimal', count: '5000', time: '30' },
    { id: 2, name: 'Asuhan Pasien Parsial', count: '2000', time: '60' },
    { id: 3, name: 'Asuhan Pasien Total', count: '500', time: '120' },
  ]);

  const [result, setResult] = useState<Result | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const { toast } = useToast();

  const handleActivityChange = (id: number, field: keyof Omit<Activity, 'id'>, value: string) => {
    setActivities(current => 
      current.map(act => (act.id === id ? { ...act, [field]: value } : act))
    );
  };

  const addActivity = () => {
    setActivities(current => [
      ...current,
      { id: Date.now(), name: '', count: '', time: '' },
    ]);
  };

  const removeActivity = (id: number) => {
    setActivities(current => current.filter(act => act.id !== id));
  };
  
  const handleCalculate = () => {
    const workDays = Number(inputs.workDaysPerYear) || 0;
    const nonWorkDays = Number(inputs.nonWorkDaysPerYear) || 0;
    const hoursPerDay = Number(inputs.hoursPerWorkDay) || 0;
    const indirectMinutes = Number(inputs.indirectCareMinutesPerDay) || 0;

    const availableWorkDays = workDays - nonWorkDays;
    if (availableWorkDays <= 0 || hoursPerDay <= 0) {
      toast({
        title: 'Input Tidak Valid',
        description: 'Hari kerja tersedia dan jam kerja per hari harus lebih dari 0.',
        variant: 'destructive',
      });
      return;
    }
    
    const availableWorkTimeHours = availableWorkDays * hoursPerDay;

    const totalDirectCareHours = activities.reduce((total, act) => {
      const count = Number(act.count) || 0;
      const time = Number(act.time) || 0;
      return total + (count * time) / 60;
    }, 0);

    const workloadStandard = totalDirectCareHours / availableWorkTimeHours;

    const availableMinutesPerDay = hoursPerDay * 60;
    const productiveMinutesPerDay = availableMinutesPerDay - indirectMinutes;

    if (productiveMinutesPerDay <= 0) {
      toast({
        title: 'Input Tidak Valid',
        description: 'Waktu kelonggaran tidak boleh melebihi total jam kerja harian.',
        variant: 'destructive',
      });
      return;
    }

    const allowanceFactor = availableMinutesPerDay / productiveMinutesPerDay;

    const totalNurses = workloadStandard * allowanceFactor;

    setResult({ total: Math.ceil(totalNurses) });
    setShowAnalysis(true);
  };

  const handleReset = () => {
    setInputs({
      workDaysPerYear: '260',
      nonWorkDaysPerYear: '86',
      hoursPerWorkDay: '7',
      indirectCareMinutesPerDay: '60',
    });
    setActivities([
      { id: 1, name: 'Asuhan Pasien Minimal', count: '5000', time: '30' },
      { id: 2, name: 'Asuhan Pasien Parsial', count: '2000', time: '60' },
      { id: 3, name: 'Asuhan Pasien Total', count: '500', time: '120' },
    ]);
    setResult(null);
    setShowAnalysis(false);
  };
  
  // For analysis display
  const workDaysVal = Number(inputs.workDaysPerYear) || 0;
  const nonWorkDaysVal = Number(inputs.nonWorkDaysPerYear) || 0;
  const hoursPerDayVal = Number(inputs.hoursPerWorkDay) || 0;
  const indirectMinutesVal = Number(inputs.indirectCareMinutesPerDay) || 0;
  const availableWorkDaysVal = workDaysVal - nonWorkDaysVal;
  const availableWorkTimeHoursVal = availableWorkDaysVal * hoursPerDayVal;
  const totalDirectCareHoursVal = activities.reduce((total, act) => (total + (Number(act.count) || 0) * (Number(act.time) || 0) / 60), 0);
  const workloadStandardVal = isFinite(totalDirectCareHoursVal / availableWorkTimeHoursVal) ? totalDirectCareHoursVal / availableWorkTimeHoursVal : 0;
  const allowanceFactorVal = isFinite((hoursPerDayVal*60) / ((hoursPerDayVal*60) - indirectMinutesVal)) ? (hoursPerDayVal*60) / ((hoursPerDayVal*60) - indirectMinutesVal) : 0;
  const totalNursesVal = workloadStandardVal * allowanceFactorVal;


  return (
    <Card>
      <CardHeader>
        <CardTitle>Metode WISN (Workload Indicators of Staffing Need)</CardTitle>
        <CardDescription>Berdasarkan beban kerja nyata yang dibutuhkan untuk pelayanan.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4 rounded-md border p-4">
          <h4 className="font-semibold text-sm text-primary">1. Konfigurasi Waktu Kerja Tahunan</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div><Label>Hari Kerja/Tahun</Label><Input type="number" value={inputs.workDaysPerYear} onChange={e => setInputs(i => ({...i, workDaysPerYear: e.target.value}))} /></div>
            <div><Label>Total Hari Non-Kerja</Label><Input type="number" value={inputs.nonWorkDaysPerYear} onChange={e => setInputs(i => ({...i, nonWorkDaysPerYear: e.target.value}))} /></div>
            <div><Label>Jam Kerja/Hari</Label><Input type="number" value={inputs.hoursPerDay} onChange={e => setInputs(i => ({...i, hoursPerWorkDay: e.target.value}))} /></div>
          </div>
        </div>
        
        <div className="space-y-4 rounded-md border p-4">
          <h4 className="font-semibold text-sm text-primary">2. Beban Kerja Pokok (Direct Care)</h4>
           <div className="overflow-x-auto">
             <Table className="text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Nama Kegiatan</TableHead>
                    <TableHead>Jml. Klien/Tahun</TableHead>
                    <TableHead>Waktu/Kegiatan (menit)</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.map((act, index) => (
                    <TableRow key={act.id}>
                      <TableCell><Input placeholder="Contoh: Merawat luka" value={act.name} onChange={e => handleActivityChange(act.id, 'name', e.target.value)} /></TableCell>
                      <TableCell><Input type="number" placeholder="0" value={act.count} onChange={e => handleActivityChange(act.id, 'count', e.target.value)} /></TableCell>
                      <TableCell><Input type="number" placeholder="0" value={act.time} onChange={e => handleActivityChange(act.id, 'time', e.target.value)} /></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => removeActivity(act.id)} className="h-8 w-8 text-destructive/80 hover:text-destructive">
                           <Trash className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
           </div>
           <Button variant="outline" size="sm" onClick={addActivity} className="w-full mt-2"><Plus className="mr-2 h-4 w-4"/>Tambah Kegiatan</Button>
        </div>

        <div className="space-y-2 rounded-md border p-4">
          <h4 className="font-semibold text-sm text-primary">3. Waktu Kelonggaran</h4>
          <div>
            <Label>Rata-rata waktu non-pelayanan per hari (menit)</Label>
            <Input type="number" value={inputs.indirectCareMinutesPerDay} onChange={e => setInputs(i => ({...i, indirectCareMinutesPerDay: e.target.value}))} />
            <p className="text-xs text-muted-foreground pt-1">
              Contoh: Rapat, menyusun laporan, dll.
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 pt-2">
          <Button onClick={handleCalculate} className="w-full"><Calculator />Hitung</Button>
          <Button onClick={handleReset} variant="outline" className="w-full"><RotateCcw/>Reset</Button>
        </div>

        {showAnalysis && result && isFinite(totalNursesVal) && (
            <div className="mt-4 p-4 border rounded-lg bg-background text-sm space-y-2">
                <h4 className="font-semibold text-primary">Analisa Perhitungan</h4>
                <p className="text-muted-foreground">1. Waktu Kerja Tersedia: <br/><span className="font-mono text-foreground text-xs block pl-2">({workDaysVal} - {nonWorkDaysVal}) * {hoursPerDayVal} jam = <b>{availableWorkTimeHoursVal.toFixed(2)} jam/tahun</b></span></p>
                <p className="text-muted-foreground">2. Kebutuhan Waktu Direct Care: <br/><span className="font-mono text-foreground text-xs block pl-2">Total dari semua kegiatan = <b>{totalDirectCareHoursVal.toFixed(2)} jam/tahun</b></span></p>
                <p className="text-muted-foreground">3. Standar Beban Kerja: <br/><span className="font-mono text-foreground text-xs block pl-2">{totalDirectCareHoursVal.toFixed(2)} jam / {availableWorkTimeHoursVal.toFixed(2)} jam = <b>{workloadStandardVal.toFixed(4)}</b></span></p>
                <p className="text-muted-foreground">4. Faktor Kelonggaran: <br/><span className="font-mono text-foreground text-xs block pl-2">({hoursPerDayVal} * 60) / (({hoursPerDayVal} * 60) - {indirectMinutesVal}) = <b>{allowanceFactorVal.toFixed(4)}</b></span></p>
                <p className="text-muted-foreground">5. Total Kebutuhan Tenaga: <br/><span className="font-mono text-foreground text-xs block pl-2">{workloadStandardVal.toFixed(4)} * {allowanceFactorVal.toFixed(4)} = {totalNursesVal.toFixed(2)} &#x2192; <b>{result.total} perawat</b> (dibulatkan)</span></p>
            </div>
        )}
      </CardContent>
      <CardFooter>
        <ResultDisplay result={result} unit="Perawat" />
      </CardFooter>
    </Card>
  );
};


const ProBadge = () => (
  <Badge variant="outline" className="ml-2 bg-accent/20 border-accent/50 text-accent font-bold text-xs">
    Pro
  </Badge>
);

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
      <div className="w-full max-w-2xl mx-auto space-y-4">
        <Tabs
          defaultValue="depkes"
          className="border rounded-lg p-4 bg-card shadow-sm"
        >
          <TabsList className="grid h-auto w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-4">
            <TabsTrigger value="depkes">Depkes RI</TabsTrigger>
            <TabsTrigger value="douglas" disabled>Douglas <ProBadge /></TabsTrigger>
            <TabsTrigger value="gillies" disabled>Gillies <ProBadge /></TabsTrigger>
            <TabsTrigger value="operating_room" disabled>Kamar Operasi <ProBadge /></TabsTrigger>
            <TabsTrigger value="wisn" disabled>WISN <ProBadge /></TabsTrigger>
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
          <TabsContent value="wisn">
            <WISNCalculator />
          </TabsContent>
        </Tabs>
        
        <Card className="bg-gradient-to-br from-primary/10 to-transparent">
          <CardHeader className="flex-row items-center gap-4">
            <div className="p-3 rounded-full bg-accent/20 border border-accent/50">
              <Sparkles className="h-6 w-6 text-accent" />
            </div>
            <div>
              <CardTitle className="text-primary">Buka Semua Metode Kalkulator</CardTitle>
              <CardDescription>
                Upgrade ke Pro untuk mendapatkan akses ke metode Douglas, Gillies, dan lainnya.
              </CardDescription>
            </div>
          </CardHeader>
          <CardFooter>
              <Button className="w-full" asChild>
                <Link href="#">
                  <Sparkles className="mr-2" />
                  Upgrade ke Pro
                </Link>
              </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
