import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function SubscriptionExpiredPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Assinatura Expirada</h1>
                <p className="text-gray-600 mb-8">
                    Sua assinatura expirou. Para continuar editando seus funis e recebendo leads, por favor renove sua assinatura.
                </p>
                <div className="space-y-3">
                    <Link href="/dashboard/settings">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                            Renovar Agora
                        </Button>
                    </Link>
                    <Link href="/dashboard">
                        <Button variant="outline" className="w-full">
                            Voltar ao Dashboard
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
