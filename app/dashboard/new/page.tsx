import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { createFunnel } from "../actions";

export default function NewProjectPage() {
    return (
        <div className="bg-slate-50 py-12 px-4">
            <Card className="w-full max-w-md mx-auto">
                <CardHeader className="pb-4">
                    <CardTitle className="text-xl">Novo Projeto</CardTitle>
                    <CardDescription>Crie um novo funil ou quiz para começar.</CardDescription>
                </CardHeader>
                <form action={createFunnel}>
                    <CardContent className="space-y-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="title">Nome do Projeto</Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="Ex: Quiz de Emagrecimento"
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="description">Descrição (Opcional)</Label>
                            <Input
                                id="description"
                                name="description"
                                placeholder="Breve descrição do objetivo..."
                            />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-4">
                        <Link href="/dashboard">
                            <Button variant="ghost" type="button">Cancelar</Button>
                        </Link>
                        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                            Criar Projeto
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
