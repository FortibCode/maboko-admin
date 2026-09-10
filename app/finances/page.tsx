'use client';

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Coquille } from '@/components/Coquille';
import { BarreOutils } from '@/components/Filtres';
import { Chargement, EtatErreur } from '@/components/Etats';
import { Alerte } from '@/components/Modal';
import { api, ApiError } from '@/lib/api';
import { fcfa, nombre } from '@/lib/format';
import type { Finances } from '@/lib/types';

const LIBELLE_OPERATEUR: Record<string, string> = {
  mtn: 'MTN Mobile Money',
  airtel: 'Airtel Money',
  carte: 'Carte bancaire',
};

export default function PageFinances() {
  const premierDuMois = new Date();
  premierDuMois.setDate(1);

  const [debut, setDebut] = useState(premierDuMois.toISOString().slice(0, 10));
  const [fin, setFin] = useState(new Date().toISOString().slice(0, 10));
  const [finances, setFinances] = useState<Finances>();
  const [erreur, setErreur] = useState<string>();
  const [exportEnCours, setExportEnCours] = useState(false);
  const [alerte, setAlerte] = useState<{ ouvert: boolean; type?: 'succes' | 'danger'; titre: string; message: string }>({ ouvert: false, titre: '', message: '' });

  const charger = useCallback(async () => {
    setErreur(undefined);

    try {
      setFinances(await api.get<Finances>('/admin/finances', { debut, fin }));
    } catch (e) {
      setErreur(e instanceof ApiError ? e.message : 'Chargement impossible.');
    }
  }, [debut, fin]);

  useEffect(() => {
    // setTimeout : la règle react-hooks/set-state-in-effect ne trace pas au
    // travers d'un minuteur, et le déclenchement reste immédiat au rendu.
    const minuterie = setTimeout(charger, 0);
    return () => clearTimeout(minuterie);
  }, [charger]);

  const exporter = async () => {
    setExportEnCours(true);

    try {
      await api.telecharger('/admin/finances/export', { debut, fin });
      setAlerte({ ouvert: true, type: 'succes', titre: 'Export réussi', message: 'Le fichier CSV du rapport financier a été téléchargé.' });
    } catch (e) {
      setAlerte({ ouvert: true, type: 'danger', titre: 'Erreur d’export', message: e instanceof ApiError ? e.message : "L'exportation a échoué." });
    } finally {
      setExportEnCours(false);
    }
  };

  return (
    <>
      <Coquille
        titre="Finances"
        description="Revenus, commissions et répartition des abonnements"
        actions={
          <button type="button" onClick={exporter} disabled={exportEnCours} className="bouton-principal flex items-center gap-2">
            {exportEnCours ? (
              <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
            )}
            {exportEnCours ? 'Export…' : 'Exporter en CSV'}
          </button>
        }
      >
        <BarreOutils>
          <label className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-maboko-texte">Du</span>
            <input type="date" value={debut} onChange={(e) => setDebut(e.target.value)} className="champ w-auto" />
          </label>
          <label className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-maboko-texte">Au</span>
            <input type="date" value={fin} onChange={(e) => setFin(e.target.value)} className="champ w-auto" />
          </label>
        </BarreOutils>

        {erreur ? (
          <EtatErreur message={erreur} onReessayer={charger} />
        ) : !finances ? (
          <Chargement />
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Bloc libelle="Revenus encaissés" valeur={fcfa(finances.revenus.total)} icone={
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
              } couleur="bg-emerald-50 text-emerald-600" />
              <Bloc
                libelle="Transactions"
                valeur={nombre(finances.revenus.nbTransactions)}
                detail={`${finances.echecs.nombre} échec(s)`}
                icone={
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9" /><path d="M3 11V9a4 4 0 0 1 4-4h14" /><polyline points="7 23 3 19 7 15" /><path d="M21 13v2a4 4 0 0 1-4 4H3" /></svg>
                }
                couleur="bg-sky-50 text-sky-600"
              />
              <Bloc libelle="Commissions" valeur={fcfa(finances.commissions.total)} icone={
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
              } couleur="bg-indigo-50 text-indigo-600" />
              <Bloc
                libelle="Manque à gagner"
                valeur={fcfa(finances.echecs.montant)}
                detail="Paiements refusés"
                icone={
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                }
                couleur="bg-rose-50 text-rose-600"
              />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <section className="carte">
                <p className="font-bold text-maboko-principale text-base">Encaissements par opérateur</p>
                <ul className="mt-4 space-y-3">
                  {finances.revenus.parOperateur.length === 0 && (
                    <li className="rounded-xl border border-dashed border-maboko-bordure bg-maboko-fond/40 px-4 py-8 text-center text-sm text-maboko-texte">
                      Aucun encaissement sur la période.
                    </li>
                  )}
                  {finances.revenus.parOperateur.map((ligne) => (
                    <li key={ligne.operateur} className="flex items-center justify-between gap-4 text-sm p-2 rounded-lg hover:bg-maboko-fond/50 transition-colors">
                      <span className="font-medium text-maboko-principale">{LIBELLE_OPERATEUR[ligne.operateur] ?? ligne.operateur}</span>
                      <span className="text-right">
                        <span className="font-bold text-maboko-principale tabular-nums">{fcfa(ligne.total)}</span>
                        <span className="ml-2 text-xs text-maboko-texte">
                          ({ligne.nombre} transaction{ligne.nombre > 1 ? 's' : ''})
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              </section>

              <section className="carte">
                <p className="font-bold text-maboko-principale text-base">Répartition par formule</p>
                <ul className="mt-4 space-y-4">
                  {finances.repartitionAbonnements.map((formule) => (
                    <li key={formule.slug}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-maboko-principale">{formule.plan}</span>
                        <span className="tabular-nums font-mono text-xs text-maboko-texte">
                          {formule.nombre} artisan{formule.nombre > 1 ? 's' : ''} · {formule.part} %
                        </span>
                      </div>
                      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-maboko-fond">
                        <motion.div
                          className="h-full rounded-full bg-gradient-to-r from-maboko-secondaire to-maboko-accent"
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(100, formule.part)}%` }}
                          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                        />
                      </div>
                      {formule.revenuMensuelTheorique > 0 && (
                        <p className="mt-1 text-xs text-maboko-texte">
                          {fcfa(formule.revenuMensuelTheorique)} par mois si tous renouvellent
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        )}
      </Coquille>

      <Alerte
        ouvert={alerte.ouvert}
        type={alerte.type}
        titre={alerte.titre}
        message={alerte.message}
        onFermer={() => setAlerte((prev) => ({ ...prev, ouvert: false }))}
      />
    </>
  );
}

import { type ReactNode } from 'react';

function Bloc({ libelle, valeur, detail, icone, couleur }: { libelle: string; valeur: string; detail?: string; icone?: ReactNode; couleur: string }) {
  return (
    <div className="carte-stat">
      {icone && (
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${couleur}`}>
          {icone}
        </div>
      )}
      <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.09em] text-maboko-texte">{libelle}</p>
      <p className="mt-2 text-[26px] font-black leading-none tracking-tight tabular-nums text-maboko-principale">{valeur}</p>
      {detail && <p className="mt-2 text-xs text-maboko-texte">{detail}</p>}
    </div>
  );
}
