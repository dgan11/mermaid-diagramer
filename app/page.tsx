'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import mermaid from 'mermaid';

// Initialize Mermaid
// We run this only once on the client
if (typeof window !== 'undefined') {
  mermaid.initialize({
    startOnLoad: false, // We'll manually render
    theme: 'base', // Use a base theme we can override
    themeVariables: {
      // --- Muji Pen Aesthetic ---
      primaryColor: '#ffffff', // Background of nodes - keep light
      primaryTextColor: '#262626', // Dark grey text like pencil/pen
      primaryBorderColor: '#525252', // Slightly darker border for subtle definition
      lineColor: '#525252', // Main color for lines/arrows
      secondaryColor: '#f5f5f4', // Background for secondary elements if needed
      tertiaryColor: '#e7e5e4', // Background for accents if needed

      // --- Font ---
      // Consider adding a specific font if you have one, otherwise default
      // fontFamily: '"Your Desired Font", sans-serif',
      fontSize: '14px',

      // --- Specific diagram type overrides (example) ---
      // You might need to fine-tune these per diagram type
      // Sequence Diagrams
      sequenceParticipantBorderColor: '#525252',
      sequenceParticipantTextColor: '#262626',
      sequenceLifeLineBorderColor: '#525252',
      sequenceLabelTextColor: '#262626',
      sequenceArrowColor: '#525252',

      // Flowchart
      nodeBorder: '#525252',
      clusterBkg: '#f5f5f4', // Background for subgraphs/clusters
      clusterBorder: '#d6d3d1',
      defaultLinkColor: '#525252',
      mainBkg: '#ffffff', // Node background
      nodeTextColor: '#262626',

      // --- Stroke Width (Handled via CSS below) ---
    },
    // Security level set to 'loose' to allow inline styles needed for some diagrams/themes
    // Be mindful of security implications if user input isn't sanitized elsewhere.
    securityLevel: 'loose',
  });
}


export default function Home() {
  const [mermaidInput, setMermaidInput] = useState(`graph TD
    subgraph User Interaction
        FE(🌐 Frontend UI)
    end

    subgraph Backend System
        Backend(⚙️ Backend Services - API, Events, Orders, Inventory)
        Cache(⚡ Redis - Caching & Locks)
        DB(🐘 Postgres DB - Events, Orders, Users)
        Kafka(🚦 Kafka Queue)
        AsyncWorkers(🛠️ Async Workers - Notifications, Reporting, etc.)
    end

    %% User Browsing Events
    FE -- GET /events --> Backend
    Backend -- Check/Fetch Events --> Cache
    Backend -- Fetch Events (if cache miss) --> DB
    Cache -- Events (Cache Hit) --> Backend
    DB -- Events (Cache Miss) --> Backend
    Backend -- Return Events --> FE

    %% User Purchasing Ticket
    FE -- POST /orders --> Backend
    Backend -- Lock Seats --> Cache
    Cache -- Lock Result --> Backend
    Backend -- If Lock OK: Create Order --> DB
    Backend -- If Lock OK: Publish Order Event --> Kafka
    Backend -- Return Status --> FE

    %% Async Processing
    Kafka -- Order Events --> AsyncWorkers
    AsyncWorkers -- Update Analytics, Send Notifications, etc. --> ExternalSystems[(📊 / 📧 ...)]`);
  const [svgOutput, setSvgOutput] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderMermaid = async () => {
      // Basic check for client-side execution
      if (typeof window === 'undefined' || !mermaidInput.trim()) {
        setSvgOutput('');
        setError(null);
        return;
      }

      try {
        // Unique ID for each render prevents potential conflicts
        const id = `mermaid-graph-${Date.now()}`;
        // mermaid.render returns the SVG code as a string
        const { svg } = await mermaid.render(id, mermaidInput);
        setSvgOutput(svg);
        setError(null); // Clear previous errors on success
      } catch (e: any) {
        console.error("Mermaid rendering error:", e);
        // Provide user-friendly error feedback
        setError(e instanceof Error ? e.message : String(e));
        setSvgOutput(''); // Clear the output on error
      }
    };

    // Debounce rendering slightly to avoid rendering on every keystroke
    const timerId = setTimeout(() => {
      renderMermaid();
    }, 300); // Adjust delay as needed (e.g., 300-500ms)

    return () => clearTimeout(timerId); // Cleanup timeout on unmount or change
  }, [mermaidInput]); // Re-run effect only when mermaidInput changes

  return (
    // Main container with cardboard background
    <main className="flex min-h-screen bg-[#D2B48C] p-4 sm:p-8 font-sans">
      {/* Grid container for the two panes - Force 3 columns, input takes 1, output takes 2 */}
      <div className="grid grid-cols-3 gap-4 sm:gap-8 flex-grow">

        {/* Left Pane: Input (1/3 width) */}
        <div className="col-span-1 flex flex-col h-[calc(100vh-4rem)] sm:h-[calc(100vh-4rem)]"> {/* Adjust height based on padding */}
          <label htmlFor="mermaid-input" className="text-sm font-medium text-neutral-700 mb-2">
            Mermaid Input:
          </label>
          <textarea
            id="mermaid-input"
            value={mermaidInput}
            onChange={(e) => setMermaidInput(e.target.value)}
            className="flex-grow p-3 rounded-md border border-neutral-300 shadow-sm focus:ring-1 focus:ring-neutral-500 focus:border-neutral-500 resize-none bg-white text-neutral-900 font-mono text-sm"
            placeholder="Paste your Mermaid diagram syntax here..."
            spellCheck="false"
          />
        </div>

        {/* Right Pane: Output (2/3 width) */}
        <div className="col-span-2 flex flex-col h-[calc(100vh-4rem)] sm:h-[calc(100vh-4rem)]"> {/* Adjust height based on padding */}
          <div className="text-sm font-medium text-neutral-700 mb-2">
            Diagram Output:
          </div>
          {/* Eggshell paper background with grid - This div now handles overflow and background */}
          <div
            className="flex-grow rounded-md border border-neutral-300 shadow-sm overflow-hidden relative bg-[#FAF8F0]" // Changed overflow-auto to overflow-hidden
            style={{
              // Subtle grid background using linear gradients
              backgroundImage: `
                linear-gradient(to right, rgba(214, 211, 209, 0.4) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(214, 211, 209, 0.4) 1px, transparent 1px)
              `,
              backgroundSize: '15px 15px', // Adjust grid size as needed
            }}
          >
            {/* Wrap the content with TransformWrapper */}
            <TransformWrapper
              initialScale={1}
              minScale={0.1} // Set minimum zoom out level
              maxScale={10}  // Set maximum zoom in level
              limitToBounds={false} // Allow panning outside initial bounds slightly
              // You can customize options like wheel={{ step: 0.1 }} etc.
            >
              <TransformComponent
                // Apply styles to the direct wrapper of the content
                wrapperStyle={{ width: '100%', height: '100%' }}
                contentStyle={{ width: '100%', height: '100%' }} // Ensure content takes space
              >
                {/* Container for the SVG - removed overflow-auto, added flex centering */}
                <div
                  className="p-4 mermaid-output-container flex items-center justify-center w-full h-full [&_svg]:max-w-none [&_svg]:h-auto" // Removed max-w-full from svg, added flex centering
                  dangerouslySetInnerHTML={{ __html: error ? `<pre class="text-red-600 p-4">${error}</pre>` : svgOutput }}
                />
              </TransformComponent>
            </TransformWrapper>
          </div>
           {error && (
            <div className="mt-2 text-xs text-red-700 bg-red-100 p-2 rounded border border-red-300">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>
      </div>
       {/* Add global styles for thin strokes */}
      <style jsx global>{`
        .mermaid-output-container .edgePath,
        .mermaid-output-container .node rect,
        .mermaid-output-container .node circle,
        .mermaid-output-container .node polygon,
        .mermaid-output-container .cluster rect,
        .mermaid-output-container .loopLine,
        .mermaid-output-container .note rect,
        .mermaid-output-container .actor {
          stroke-width: 0.7px !important; /* Target 0.5mm feel */
          vector-effect: non-scaling-stroke; /* Keep stroke width constant on zoom */
        }
         /* Optional: Slightly thinner text for a finer feel */
         /*
        .mermaid-output-container text {
          font-size: 13px !important;
        }
        */
      `}</style>
    </main>
  );
}
