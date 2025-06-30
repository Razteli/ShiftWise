'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Loader2,
  Bot,
  ListChecks,
  AlertTriangle,
} from 'lucide-react';
import {
  analyzeUploadedSchedule,
  type AnalyzeShiftScheduleOutput,
} from '@/app/actions';
import { Separator } from './ui/separator';

const analyzerSchema = z.object({
  scheduleDocument: z
    .string()
    .min(1, 'Silakan unggah gambar jadwal.'),
});
type AnalyzerFormValues = z.infer<typeof analyzerSchema>;

export function ScheduleAnalyzer() {
  const [isAnalyzing, startTransition] = useTransition();
  const { toast } = useToast();
  const [analysisResult, setAnalysisResult] =
    useState<AnalyzeShiftScheduleOutput | null>(null);

  const form = useForm<AnalyzerFormValues>({
    resolver: zodResolver(analyzerSchema),
    defaultValues: {
      scheduleDocument: '',
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue('scheduleDocument', reader.result as string, {
          shouldValidate: true,
        });
        toast({
          title: 'File Diunggah',
          description: `"${file.name}" telah dipilih untuk dianalisis.`,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (values: AnalyzerFormValues) => {
    startTransition(async () => {
      setAnalysisResult(null);
      const { data, error } = await analyzeUploadedSchedule(values);
      if (error) {
        toast({ title: 'Error', description: error, variant: 'destructive' });
      } else if (data) {
        setAnalysisResult(data);
        toast({
          title: 'Sukses!',
          description: 'Jadwal Anda telah dianalisis.',
        });
      }
    });
  };

  return (
    <div>
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">
          Analisis Jadwal yang Ada
        </h2>
        <p className="text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
          Unggah gambar jadwal Anda saat ini dan biarkan AI kami memberikan wawasan dan saran.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="w-full md:max-w-md">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>1. Unggah Jadwal</CardTitle>
                  <CardDescription>
                    Pilih file gambar jadwal yang akan dianalisis.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="scheduleDocument"
                    render={() => (
                      <FormItem>
                        <FormLabel>File Gambar Jadwal</FormLabel>
                        <FormControl>
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="file:text-primary file:font-semibold"
                            required
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Button type="submit" className="w-full" disabled={isAnalyzing}>
                {isAnalyzing ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Bot className="mr-2 h-4 w-4" />
                )}
                Analisis Jadwal dengan AI
              </Button>
            </form>
          </Form>
        </div>

        <div className="flex-1 w-full min-w-0">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Hasil Analisis AI</CardTitle>
              <CardDescription>
                Masalah dan saran yang diidentifikasi oleh AI akan muncul di sini.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 min-h-[400px]">
              {isAnalyzing ? (
                <div className="flex items-center justify-center text-muted-foreground h-full min-h-[300px]">
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  <p>Menganalisis jadwal Anda...</p>
                </div>
              ) : analysisResult ? (
                <>
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center text-destructive">
                      <AlertTriangle className="mr-2 h-4 w-4" /> Potensi Masalah
                    </h3>
                    <div className="h-60 rounded-md border p-4 bg-background/50 overflow-y-auto">
                      {analysisResult.issues.length > 0 ? (
                        <ul className="space-y-2 list-disc pl-5">
                          {analysisResult.issues.map((issue, index) => (
                            <li key={index} className="text-sm">
                              {issue}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground p-4 text-center">
                          Tidak ada masalah ditemukan.
                        </p>
                      )}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center text-primary">
                      <ListChecks className="mr-2 h-4 w-4" /> Saran
                    </h3>
                    <div className="h-60 rounded-md border p-4 bg-background/50 overflow-y-auto">
                      {analysisResult.suggestions.length > 0 ? (
                        <ul className="space-y-2 list-disc pl-5">
                          {analysisResult.suggestions.map(
                            (suggestion, index) => (
                              <li key={index} className="text-sm">
                                {suggestion}
                              </li>
                            )
                          )}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground p-4 text-center">
                          Tidak ada saran yang diberikan.
                        </p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center text-muted-foreground h-full min-h-[300px]">
                  <p>Silakan unggah jadwal untuk memulai analisis.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
