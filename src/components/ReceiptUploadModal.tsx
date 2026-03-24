import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState } from 'react';
import { AlertTriangle, Upload, CheckCircle, Clock, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ReceiptUploadModalProps {
  isOpen: boolean;
  medicationId: string;
  medicationName: string;
  customerId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReceiptUploadModal({
  isOpen,
  medicationId,
  medicationName,
  customerId,
  onClose,
  onSuccess,
}: ReceiptUploadModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    doctorName: '',
    doctorCRM: '',
    dosage: '',
    quantity: 1,
    dateIssued: '',
    dateExpires: '',
    notes: '',
  });

  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Arquivo muito grande. Máximo 5MB');
        return;
      }
      if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
        setError('Formato não suportado. Use JPG, PNG ou PDF');
        return;
      }
      setReceiptFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // ✅ Validações
      if (!formData.doctorName.trim()) {
        throw new Error('Nome do médico é obrigatório');
      }
      if (!formData.dateIssued) {
        throw new Error('Data de emissão é obrigatória');
      }
      if (!formData.dateExpires) {
        throw new Error('Data de validade é obrigatória');
      }
      if (new Date(formData.dateExpires) < new Date()) {
        throw new Error('A receita está vencida');
      }
      if (!receiptFile) {
        throw new Error('Por favor, envie uma foto da receita');
      }

      // ✅ Upload da imagem
      const fileName = `receipts/${customerId}/${Date.now()}-${receiptFile.name}`;
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('receipts')
        .upload(fileName, receiptFile);

      if (uploadError) throw uploadError;

      // ✅ Obter URL pública
      const { data } = supabase.storage.from('receipts').getPublicUrl(fileName);
      const imageUrl = data?.publicUrl;

      // ✅ Salvar receita no Supabase
      const { error: insertError } = await (supabase as any).from('receipts').insert({
        customer_id: customerId,
        medication_id: medicationId,
        medication_name: medicationName,
        doctor_name: formData.doctorName,
        doctor_crm: formData.doctorCRM,
        dosage: formData.dosage,
        quantity: formData.quantity,
        date_issued: formData.dateIssued,
        date_expires: formData.dateExpires,
        image_url: imageUrl,
        status: 'pendente', // Será verificada por admin
      } as any);

      if (insertError) throw insertError;

      onSuccess();
      handleReset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar receita');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      doctorName: '',
      doctorCRM: '',
      dosage: '',
      quantity: 1,
      dateIssued: '',
      dateExpires: '',
      notes: '',
    });
    setReceiptFile(null);
    setPreviewUrl(null);
    setError(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Receita Médica Obrigatória
          </DialogTitle>
          <DialogDescription>
            Para comprar <strong>{medicationName}</strong>, é necessário fornecer uma receita médica válida.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Alerta */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              A receita será verificada por nossos farmacêuticos. Você receberá uma notificação quando aprovada.
            </AlertDescription>
          </Alert>

          {/* Dados do médico */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Nome do Médico *</label>
            <Input
              placeholder="Dr. João Silva"
              value={formData.doctorName}
              onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">CRM (opcional)</label>
            <Input
              placeholder="12345-SP"
              value={formData.doctorCRM}
              onChange={(e) => setFormData({ ...formData, doctorCRM: e.target.value })}
            />
          </div>

          {/* Dosagem */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Dosagem *</label>
            <Input
              placeholder="Ex: 1 comprimido a cada 8 horas"
              value={formData.dosage}
              onChange={(e) => setFormData({ ...formData, dosage: e.target.value })}
            />
          </div>

          {/* Quantidade */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Quantidade *</label>
            <Input
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
            />
          </div>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-semibold">Data Emissão *</label>
              <Input
                type="date"
                value={formData.dateIssued}
                onChange={(e) => setFormData({ ...formData, dateIssued: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Vencimento *</label>
              <Input
                type="date"
                value={formData.dateExpires}
                onChange={(e) => setFormData({ ...formData, dateExpires: e.target.value })}
              />
            </div>
          </div>

          {/* Upload de arquivo */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Foto da Receita *</label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              {previewUrl ? (
                <div className="space-y-2">
                  <img src={previewUrl} alt="Preview" className="w-full max-h-32 object-cover rounded" />
                  <p className="text-xs text-green-600 flex items-center justify-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Arquivo selecionado
                  </p>
                </div>
              ) : (
                <label className="cursor-pointer space-y-2">
                  <Upload className="w-8 h-8 mx-auto text-gray-400" />
                  <p className="text-sm text-gray-600">Clique para enviar JPG, PNG ou PDF</p>
                  <p className="text-xs text-gray-500">Máximo 5MB</p>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Notas opcionais */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">Observações</label>
            <Textarea
              placeholder="Informações adicionais..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
            />
          </div>

          {/* Erro */}
          {error && (
            <Alert className="border-red-500 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {/* Status de verificação */}
          <Alert className="border-blue-500 bg-blue-50">
            <Clock className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              Tempo médio de verificação: 2-4 horas
            </AlertDescription>
          </Alert>

          {/* Botões */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading} className="flex-1">
              {isLoading ? '⏳ Enviando...' : '✅ Enviar Receita'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
