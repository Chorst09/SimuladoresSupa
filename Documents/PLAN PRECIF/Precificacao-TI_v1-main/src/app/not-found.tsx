import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Página não encontrada</h2>
                <p className="mb-4">A página que você está procurando não existe.</p>
                <Link
                    href="/"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                    Voltar ao início
                </Link>
            </div>
        </div>
    )
}