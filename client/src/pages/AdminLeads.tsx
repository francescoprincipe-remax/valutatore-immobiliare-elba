import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Filter, Users, TrendingUp, MapPin } from 'lucide-react';
import { useAuth } from '@/_core/hooks/useAuth';
import { useLocation } from 'wouter';

export default function AdminLeads() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Filtri
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    comune: '',
    prezzoMin: '',
    prezzoMax: '',
  });

  // Query lead
  const { data: leads, isLoading, refetch } = trpc.lead.getAll.useQuery(
    {
      dateFrom: filters.dateFrom ? new Date(filters.dateFrom) : undefined,
      dateTo: filters.dateTo ? new Date(filters.dateTo) : undefined,
      comune: filters.comune || undefined,
      prezzoMin: filters.prezzoMin ? parseInt(filters.prezzoMin) : undefined,
      prezzoMax: filters.prezzoMax ? parseInt(filters.prezzoMax) : undefined,
    },
    {
      enabled: user?.role === 'admin',
    }
  );

  // Query statistiche
  const { data: stats } = trpc.lead.getStats.useQuery(undefined, {
    enabled: user?.role === 'admin',
  });

  // Redirect se non admin
  if (!authLoading && user?.role !== 'admin') {
    setLocation('/');
    return null;
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Caricamento...</p>
        </div>
      </div>
    );
  }

  const handleExportCSV = () => {
    if (!leads || leads.length === 0) return;

    // Crea CSV
    const headers = ['ID', 'Data', 'Nome', 'Cognome', 'Email', 'Telefono', 'Comune', 'Tipologia', 'Superficie', 'Valore Stimato', 'GDPR'];
    const rows = leads.map(lead => [
      lead.id,
      new Date(lead.createdAt).toLocaleDateString('it-IT'),
      lead.nome,
      lead.cognome,
      lead.email,
      lead.telefono,
      lead.comune || '-',
      lead.tipologia || '-',
      lead.superficie || '-',
      lead.valoreTotale ? `€${lead.valoreTotale.toLocaleString()}` : '-',
      lead.gdprConsent ? 'Sì' : 'No',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `leads_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleResetFilters = () => {
    setFilters({
      dateFrom: '',
      dateTo: '',
      comune: '',
      prezzoMin: '',
      prezzoMax: '',
    });
    refetch();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Dashboard Lead</h1>
              <p className="text-sm text-muted-foreground">Gestione e monitoraggio lead generati</p>
            </div>
            <Button onClick={() => setLocation('/')} variant="outline">
              Torna alla Home
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-8">
        {/* Statistiche */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Totale Lead</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalLeads || 0}</div>
              <p className="text-xs text-muted-foreground">Lead raccolti in totale</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Comune Più Attivo</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.leadsByComune && stats.leadsByComune.length > 0
                  ? stats.leadsByComune[0].comune || 'N/D'
                  : 'N/D'}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.leadsByComune && stats.leadsByComune.length > 0
                  ? `${stats.leadsByComune[0].count} lead`
                  : 'Nessun dato'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trend Mensile</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats?.leadsByMonth && stats.leadsByMonth.length > 0
                  ? stats.leadsByMonth[stats.leadsByMonth.length - 1].count
                  : 0}
              </div>
              <p className="text-xs text-muted-foreground">Lead questo mese</p>
            </CardContent>
          </Card>
        </div>

        {/* Filtri */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtri
            </CardTitle>
            <CardDescription>Filtra i lead per data, comune o prezzo stimato</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Data Da</label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Data A</label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Comune</label>
                <Select value={filters.comune} onValueChange={(value) => setFilters({ ...filters, comune: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tutti" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Tutti</SelectItem>
                    <SelectItem value="Portoferraio">Portoferraio</SelectItem>
                    <SelectItem value="Campo nell'Elba">Campo nell'Elba</SelectItem>
                    <SelectItem value="Capoliveri">Capoliveri</SelectItem>
                    <SelectItem value="Marciana">Marciana</SelectItem>
                    <SelectItem value="Marciana Marina">Marciana Marina</SelectItem>
                    <SelectItem value="Porto Azzurro">Porto Azzurro</SelectItem>
                    <SelectItem value="Rio">Rio</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Prezzo Min (€)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.prezzoMin}
                  onChange={(e) => setFilters({ ...filters, prezzoMin: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Prezzo Max (€)</label>
                <Input
                  type="number"
                  placeholder="1000000"
                  value={filters.prezzoMax}
                  onChange={(e) => setFilters({ ...filters, prezzoMax: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => refetch()}>Applica Filtri</Button>
              <Button onClick={handleResetFilters} variant="outline">
                Reset
              </Button>
              <Button onClick={handleExportCSV} variant="outline" className="ml-auto">
                <Download className="h-4 w-4 mr-2" />
                Esporta CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabella Lead */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Raccolti ({leads?.length || 0})</CardTitle>
            <CardDescription>Elenco completo dei contatti generati dal valutatore</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefono</TableHead>
                    <TableHead>Comune</TableHead>
                    <TableHead>Tipologia</TableHead>
                    <TableHead>Superficie</TableHead>
                    <TableHead>Valore Stimato</TableHead>
                    <TableHead>GDPR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads && leads.length > 0 ? (
                    leads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>{new Date(lead.createdAt).toLocaleDateString('it-IT')}</TableCell>
                        <TableCell className="font-medium">
                          {lead.nome} {lead.cognome}
                        </TableCell>
                        <TableCell>{lead.email}</TableCell>
                        <TableCell>{lead.telefono}</TableCell>
                        <TableCell>{lead.comune || '-'}</TableCell>
                        <TableCell>{lead.tipologia || '-'}</TableCell>
                        <TableCell>{lead.superficie ? `${lead.superficie} mq` : '-'}</TableCell>
                        <TableCell>
                          {lead.valoreTotale ? `€${lead.valoreTotale.toLocaleString()}` : '-'}
                        </TableCell>
                        <TableCell>
                          {lead.gdprConsent ? (
                            <span className="text-green-600 font-medium">✓</span>
                          ) : (
                            <span className="text-red-600">✗</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                        Nessun lead trovato
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
