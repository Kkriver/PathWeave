import FullPathWeaveView from './FullPathWeaveView'
import StructuredJsonView from './StructuredJsonView'
import SummaryExportView from './SummaryExportView'

export default function PathWeaveOutputs({ mode, output }) {
  if (mode === 'summary') {
    return <SummaryExportView output={output} />
  }

  if (mode === 'structured') {
    return <StructuredJsonView output={output} />
  }

  return <FullPathWeaveView output={output} />
}

