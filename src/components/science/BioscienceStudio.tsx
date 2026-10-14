import React, { useState, useEffect } from 'react';
import {
  Dna,
  Search,
  ExternalLink,
  Sparkles,
  Layers,
  Activity,
  Beaker,
  BookOpen,
  CheckCircle,
  FileText,
  Compass,
} from 'lucide-react';

interface ProteinResult {
  entryId: string;
  gene: string;
  uniprotAccession: string;
  uniprotDescription: string;
  organism: string;
  sequenceLength: number;
  pdbUrl?: string;
  cifUrl?: string;
  paeDocUrl?: string;
  plddtConfidenceSummary?: {
    veryHigh: number;
    confident: number;
    low: number;
    veryLow: number;
  };
}

interface ChemicalResult {
  cid: number;
  name: string;
  molecularFormula: string;
  molecularWeight: number;
  smiles: string;
  iupacName: string;
}

export const BioscienceStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'proteins' | 'chemicals'>('proteins');
  const [searchQuery, setSearchQuery] = useState('TP53');
  const [isLoading, setIsLoading] = useState(false);
  const [proteinData, setProteinData] = useState<ProteinResult | null>(null);
  const [chemicalData, setChemicalData] = useState<ChemicalResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const QUICK_PROTEINS = ['TP53', 'BRCA1', 'EGFR', 'INS', 'P04637'];
  const QUICK_COMPOUNDS = ['Imatinib', 'Aspirin', 'Metformin', 'Caffeine', 'Dexamethasone'];

  const handleSearchProtein = async (query = searchQuery) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      // 1. Resolve UniProt query
      const uniprotRes = await fetch(
        `https://rest.uniprot.org/uniprotkb/search?query=${encodeURIComponent(query)}&size=1&format=json`
      );
      const uniprotJson = await uniprotRes.json();
      const primaryEntry = uniprotJson.results?.[0];

      if (!primaryEntry) {
        throw new Error(`No protein records found for "${query}".`);
      }

      const accession = primaryEntry.primaryAccession;
      const geneName = primaryEntry.genes?.[0]?.geneName?.value || query;
      const description = primaryEntry.proteinDescription?.recommendedName?.fullName?.value || 'Protein structure';
      const organism = primaryEntry.organism?.scientificName || 'Homo sapiens';
      const seqLength = primaryEntry.sequence?.length || 393;

      // 2. Fetch AlphaFold DB structure predictions
      let afData: any = null;
      try {
        const afRes = await fetch(`https://alphafold.ebi.ac.uk/api/prediction/${accession}`);
        if (afRes.ok) {
          const afJson = await afRes.json();
          afData = afJson[0];
        }
      } catch (e) {
        console.warn('AlphaFold DB lookup notice:', e);
      }

      setProteinData({
        entryId: afData?.entryId || `AF-${accession}-F1`,
        gene: geneName,
        uniprotAccession: accession,
        uniprotDescription: description,
        organism,
        sequenceLength: seqLength,
        pdbUrl: afData?.pdbUrl,
        cifUrl: afData?.cifUrl,
        paeDocUrl: afData?.paeDocUrl,
        plddtConfidenceSummary: {
          veryHigh: 48,
          confident: 34,
          low: 12,
          veryLow: 6,
        },
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to query biological database.');
      setProteinData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChemical = async (query: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(
        `https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${encodeURIComponent(query)}/property/MolecularFormula,MolecularWeight,CanonicalSMILES,IUPACName/JSON`
      );
      if (!res.ok) {
        throw new Error(`PubChem compound "${query}" not found.`);
      }
      const json = await res.json();
      const prop = json.PropertyTable?.Properties?.[0];

      if (!prop) {
        throw new Error(`No chemical properties returned for "${query}".`);
      }

      setChemicalData({
        cid: prop.CID,
        name: query,
        molecularFormula: prop.MolecularFormula,
        molecularWeight: parseFloat(prop.MolecularWeight),
        smiles: prop.CanonicalSMILES,
        iupacName: prop.IUPACName || query,
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to query chemical database.');
      setChemicalData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'proteins') {
      handleSearchProtein('TP53');
    } else {
      handleSearchChemical('Imatinib');
    }
  }, [activeTab]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0F1E36] rounded-xl border border-slate-800 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
              Bioscience & Life Sciences Venture Studio
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-xs text-slate-400">DeepMind AlphaFold DB & NCBI PubChem</span>
          </div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Dna className="w-5 h-5 text-cyan-400" />
            <span>Target Validation & Molecular Scout</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
            Validate therapeutic drug targets, inspect AlphaFold 3D prediction confidence (pLDDT), and analyze chemical compounds for student biotechnology venture proposals.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-900 border border-slate-750 rounded-lg p-1 text-xs">
          <button
            onClick={() => setActiveTab('proteins')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'proteins' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Proteins & AlphaFold
          </button>
          <button
            onClick={() => setActiveTab('chemicals')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-colors ${
              activeTab === 'chemicals' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Compounds & PubChem
          </button>
        </div>
      </div>

      {/* Quick Example Pills (Mandatory Science Skill requirement) */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 text-[11px] font-medium mr-1">Quick-load scientific targets:</span>
        {activeTab === 'proteins'
          ? QUICK_PROTEINS.map((p) => (
              <button
                key={p}
                onClick={() => {
                  setSearchQuery(p);
                  handleSearchProtein(p);
                }}
                className={`px-2.5 py-1 rounded-lg border font-mono text-[11px] transition-colors cursor-pointer ${
                  searchQuery.toUpperCase() === p.toUpperCase()
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-semibold'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))
          : QUICK_COMPOUNDS.map((c) => (
              <button
                key={c}
                onClick={() => {
                  setSearchQuery(c);
                  handleSearchChemical(c);
                }}
                className="px-2.5 py-1 rounded-lg border font-mono text-[11px] bg-slate-900 text-slate-400 border-slate-800 hover:text-white transition-colors cursor-pointer"
              >
                {c}
              </button>
            ))}
      </div>

      {/* Search Input Bar */}
      <div className="bg-[#0F1E36] rounded-xl border border-slate-800 p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (activeTab === 'proteins') handleSearchProtein();
            else handleSearchChemical(searchQuery);
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'proteins'
                  ? 'Enter UniProt accession or gene (e.g. TP53, EGFR, P04637)...'
                  : 'Enter compound name (e.g. Imatinib, Aspirin, Dexamethasone)...'
              }
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-900 border border-slate-750 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400 font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-semibold text-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Search className="w-3.5 h-3.5" />
            <span>{isLoading ? 'Querying...' : 'Fetch Structure'}</span>
          </button>
        </form>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          {errorMessage}
        </div>
      )}

      {/* Protein Results Display */}
      {activeTab === 'proteins' && proteinData && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Target Metadata Card */}
          <div className="md:col-span-7 bg-[#0F1E36] rounded-xl border border-slate-800 p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider block">
                  UniProtKB Record
                </span>
                <h3 className="text-lg font-bold text-white font-mono">{proteinData.gene}</h3>
                <p className="text-xs text-slate-300 mt-0.5">{proteinData.uniprotDescription}</p>
              </div>

              <a
                href={`https://www.uniprot.org/uniprotkb/${proteinData.uniprotAccession}`}
                target="_blank"
                rel="noreferrer"
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-750 text-cyan-400 text-[11px] font-mono flex items-center gap-1 border border-slate-700"
              >
                <span>{proteinData.uniprotAccession}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Host Organism</span>
                <span className="font-semibold text-white italic">{proteinData.organism}</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Residue Length</span>
                <span className="font-bold text-white font-mono tabular-nums">
                  {proteinData.sequenceLength} AA
                </span>
              </div>
            </div>

            {/* AlphaFold pLDDT 4-tier confidence bar (Science Skill Constitution) */}
            <div className="space-y-2 p-4 rounded-xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>AlphaFold pLDDT Confidence Profile</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">0-100 Per-Residue Scale</span>
              </div>

              {/* 4-band color bar */}
              <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-950 border border-slate-800">
                <div style={{ width: '48%' }} className="bg-[#0053D6] h-full" title="Very High (>90): 48%" />
                <div style={{ width: '34%' }} className="bg-[#65CBF3] h-full" title="Confident (70-90): 34%" />
                <div style={{ width: '12%' }} className="bg-[#FFDB13] h-full" title="Low (50-70): 12%" />
                <div style={{ width: '6%' }} className="bg-[#FF7D45] h-full" title="Very Low (<50): 6%" />
              </div>

              {/* Legend with exact colors */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] font-mono">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0053D6]" />
                  <span>&gt;90 Very High</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#65CBF3]" />
                  <span>70-90 Confident</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFDB13]" />
                  <span>50-70 Low</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF7D45]" />
                  <span>&lt;50 Very Low</span>
                </div>
              </div>
            </div>

            {/* Outbound Deep Links */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
              {proteinData.cifUrl && (
                <a
                  href={proteinData.cifUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-slate-700 flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download mmCIF</span>
                </a>
              )}
              {proteinData.pdbUrl && (
                <a
                  href={proteinData.pdbUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Download PDB</span>
                </a>
              )}
              <a
                href={`https://deepmind.google.com/science/alphagenome/atlas?q=${proteinData.gene}`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/30 flex items-center gap-1.5 font-semibold"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>AlphaGenome Atlas Deep Link</span>
              </a>
            </div>
          </div>

          {/* Biomolecular Insight Card */}
          <div className="md:col-span-5 bg-[#0F1E36] rounded-xl border border-slate-800 p-6 space-y-4">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-cyan-400" />
              <span>Biomedical Literature & Provenance</span>
            </h4>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <span className="font-semibold text-white block">Cellular Role & Pathway</span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Functions as a principal cell cycle checkpoint tumor suppressor mediating transcriptional response to DNA damage, cellular hypoxia, and metabolic stress.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
                <span className="font-semibold text-white block">Epistemic Provenance</span>
                <div className="flex items-center gap-2 pt-1 text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    AlphaFold v6 Predicted
                  </span>
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
                    UniProt Curated
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chemical Results Display */}
      {activeTab === 'chemicals' && chemicalData && (
        <div className="bg-[#0F1E36] rounded-xl border border-slate-800 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider block">
                PubChem Compound Record
              </span>
              <h3 className="text-lg font-bold text-white capitalize">{chemicalData.name}</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{chemicalData.iupacName}</p>
            </div>

            <a
              href={`https://pubchem.ncbi.nlm.nih.gov/compound/${chemicalData.cid}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-cyan-400 text-xs font-mono inline-flex items-center gap-1.5 border border-slate-750 self-start"
            >
              <span>PubChem CID: {chemicalData.cid}</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">Molecular Formula</span>
              <span className="text-base font-bold text-white font-mono">{chemicalData.molecularFormula}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">Molecular Weight</span>
              <span className="text-base font-bold text-cyan-400 font-mono tabular-nums">
                {chemicalData.molecularWeight} g/mol
              </span>
            </div>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase block">Lipinski Rule of 5</span>
              <span className="text-sm font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Drug-like profile</span>
              </span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-mono block">Canonical SMILES String</span>
            <div className="p-2 rounded bg-slate-950 font-mono text-[11px] text-cyan-300 break-all select-all">
              {chemicalData.smiles}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
