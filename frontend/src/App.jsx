import { useState } from "react"
import axios from "axios"
import { Shield, Upload, AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react"
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts"

// What is useState?
// It's React's way of storing data that can change over time.
// When state changes, React automatically re-renders the component.
// Think of it as variables that React watches and reacts to.

const SEVERITY_COLORS = {
  CRITICAL: "#ef4444",
  HIGH: "#f97316", 
  MEDIUM: "#eab308",
  LOW: "#22c55e"

}

const SEVERITY_ICONS = {
  CRITICAL: <XCircle className="w-4 h-4 text-red-500" />,
  HIGH: <AlertTriangle className="w-4 h-4 text-orange-500" />,
  MEDIUM: <Info className="w-4 h-4 text-yellow-500" />,
  LOW: <CheckCircle className="w-4 h-4 text-green-500" />
}

// What is a component?
// A component is a reusable piece of UI.
// App is our main component — it contains everything.
// Think of it as a LEGO brick that holds all the other bricks.

export default function App() {

  // These are our state variables:
  const [file, setFile] = useState(null)           // the uploaded file
  const [loading, setLoading] = useState(false)    // true while AI is analyzing
  const [result, setResult] = useState(null)       // the analysis result
  const [error, setError] = useState(null)         // any error messages
  const [dragOver, setDragOver] = useState(false)  // for drag and drop styling

  // What is an async function?
  // Some operations take time — like waiting for the AI to respond.
  // async/await lets us wait for those operations without freezing the browser.

  const analyzeLog = async (uploadFile) => {
    setLoading(true)
    setError(null)
    setResult(null)

    // What is FormData?
    // It's a special object for sending files over HTTP.
    // You can't send a file as plain JSON — FormData packages it correctly.

    const formData = new FormData()
    formData.append("file", uploadFile)

    try {
      // What is axios?
      // It's a library that makes HTTP requests simple.
      // Here we're sending a POST request to our FastAPI backend
      // with the log file attached.

      const response = await axios.post("https://cloudwatch-sentinel-production.up.railway.app/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })

      setResult(response.data)
    } catch (err) {
      setError(err.response?.data?.detail || "Analysis failed. Make sure the backend is running.")
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (selected) {
      setFile(selected)
      analyzeLog(selected)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) {
      setFile(dropped)
      analyzeLog(dropped)
    }
  }

  // Prepare chart data from threat breakdown
  const getChartData = () => {
    if (!result?.analysis?.threat_breakdown) return []
    return Object.entries(result.analysis.threat_breakdown)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({ name, value }))
  }

  const getRiskBadgeColor = (risk) => {
    const colors = {
      CRITICAL: "bg-red-100 text-red-800 border-red-200",
      HIGH: "bg-orange-100 text-orange-800 border-orange-200",
      MEDIUM: "bg-yellow-100 text-yellow-800 border-yellow-200",
      LOW: "bg-green-100 text-green-800 border-green-200",
      UNKNOWN: "bg-gray-100 text-gray-800 border-gray-200"
    }
    return colors[risk] || colors.UNKNOWN
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-400" />
          <div>
            <h1 className="text-xl font-bold text-white">CloudWatch Sentinel</h1>
            <p className="text-xs text-gray-400">AI-Powered Security Log Analyzer</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Upload Area */}
        <div
          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-200 mb-8
            ${dragOver ? "border-blue-400 bg-blue-950/20" : "border-gray-700 hover:border-gray-500 bg-gray-900/50"}`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById("fileInput").click()}
        >
          <Upload className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-300 mb-2">
            Drop your log file here or click to browse
          </p>
          <p className="text-sm text-gray-500">Supports .log .txt .csv files</p>
          {file && (
            <p className="mt-3 text-sm text-blue-400">
              Selected: {file.name}
            </p>
          )}
          <input
            id="fileInput"
            type="file"
            accept=".log,.txt,.csv"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="w-12 h-12 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 text-lg">AI Agent is analyzing your logs...</p>
            <p className="text-gray-600 text-sm mt-2">This usually takes 5-10 seconds</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-950/50 border border-red-800 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-3">
              <XCircle className="w-6 h-6 text-red-400" />
              <p className="text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-6">

            {/* Summary Card */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-white mb-1">Analysis Summary</h2>
                  <p className="text-gray-400 text-sm">{result.filename}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getRiskBadgeColor(result.analysis.risk_level)}`}>
                  {result.analysis.risk_level} RISK
                </span>
              </div>
              <p className="text-gray-300">{result.analysis.summary}</p>
              <div className="mt-4 grid grid-cols-4 gap-4">
                {Object.entries(result.analysis.threat_breakdown || {}).map(([severity, count]) => (
                  <div key={severity} className="bg-gray-800 rounded-lg p-3 text-center">
                    <p className="text-2xl font-bold" style={{ color: SEVERITY_COLORS[severity] }}>{count}</p>
                    <p className="text-xs text-gray-400 mt-1">{severity}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart + Threats Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Pie Chart */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-md font-semibold text-white mb-4">Threat Breakdown</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={getChartData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {getChartData().map((entry) => (
                        <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
                      labelStyle={{ color: "#f9fafb" }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Threats List */}
              <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-md font-semibold text-white mb-4">
                  Detected Threats ({result.analysis.total_threats || result.analysis.threats?.length || 0})
                </h3>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {result.analysis.threats?.map((threat) => (
                    <div key={threat.id} className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {SEVERITY_ICONS[threat.severity?.toUpperCase()]}
                          <span className="font-medium text-white text-sm">{threat.type}</span>
                        </div>
                        <span
                          className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{
                            backgroundColor: SEVERITY_COLORS[threat.severity?.toUpperCase()] + "20",
                            color: SEVERITY_COLORS[threat.severity?.toUpperCase()]
                          }}
                        >
                          {threat.severity?.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs mb-2">{threat.description}</p>
                      <p className="text-blue-400 text-xs"> {threat.recommendation}</p>
                      {threat.timestamp && (
                        <p className="text-gray-600 text-xs mt-1"> {threat.timestamp}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  )
}