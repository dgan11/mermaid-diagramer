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
      primaryColor: '#F8F6F0', // Eggshell white background instead of transparent
      primaryTextColor: '#424242', // Using our ink color
      primaryBorderColor: '#424242', // Pen stroke color
      lineColor: '#424242', // Main color for lines/arrows
      secondaryColor: '#F8F6F0', // Eggshell white for secondary elements
      tertiaryColor: '#F8F6F0', // Eggshell white for accents
      
      // General text and background colors
      edgeLabelBackground: '#F8F6F0', // Eggshell white for edge labels
      textColor: '#424242',
      noteTextColor: '#424242',
      noteBkgColor: '#F8F6F0', // Eggshell white for notes

      // --- Font ---
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: '14px',

      // --- Specific diagram type overrides ---
      // Sequence Diagrams
      sequenceParticipantBorderColor: '#424242',
      sequenceParticipantTextColor: '#424242',
      sequenceLifeLineBorderColor: '#424242',
      sequenceLabelTextColor: '#424242',
      sequenceArrowColor: '#424242',
      sequenceMessageBackground: '#F8F6F0', // Eggshell white for messages

      // Flowchart
      nodeBorder: '#424242',
      clusterBkg: '#F8F6F0', // Eggshell white for clusters
      clusterBorder: '#424242',
      defaultLinkColor: '#424242',
      mainBkg: '#F8F6F0', // Eggshell white for nodes
      labelBackground: '#F8F6F0', // Eggshell white for labels
      nodeTextColor: '#424242',
    },
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
      } catch (e: unknown) {
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
    // Main container - removed background color to use the one from globals.css
    <main className="flex flex-col min-h-screen p-6 sm:p-10 font-sans">
      {/* App title - extremely minimal */}
      <h1 className="text-center text-[var(--muji-ink)] text-lg mb-6 tracking-wider">mermaid diagramer</h1>
      
      {/* Grid container for the two panes */}
      <div className="grid grid-cols-3 gap-6 sm:gap-10 flex-grow">

        {/* Left Pane: Input (1/3 width) */}
        <div className="col-span-1 flex flex-col h-[calc(100vh-8rem)] sm:h-[calc(100vh-8rem)]">
          <label 
            htmlFor="mermaid-input" 
            className="mb-4 text-base font-medium text-[var(--muji-ink)] pb-1 border-b border-[var(--muji-ink)] border-opacity-20 inline-block"
          >
            Mermaid Input
          </label>
          <textarea
            id="mermaid-input"
            value={mermaidInput}
            onChange={(e) => setMermaidInput(e.target.value)}
            className="flex-grow p-4 rounded-md border border-[var(--muji-border)] shadow-sm focus:ring-1 focus:ring-[var(--muji-ink)] focus:border-[var(--muji-ink)] resize-none bg-white/90 text-[var(--muji-ink)] font-sans text-sm"
            placeholder="Paste your Mermaid diagram syntax here..."
            spellCheck="false"
          />
        </div>

        {/* Right Pane: Output (2/3 width) */}
        <div className="col-span-2 flex flex-col h-[calc(100vh-8rem)] sm:h-[calc(100vh-8rem)]">
          <div 
            className="mb-4 text-base font-medium text-[var(--muji-ink)] pb-1 border-b border-[var(--muji-ink)] border-opacity-20 inline-block"
          >
            Diagram Output
          </div>
          {/* Output container - removed background/grid styles to use global ones */}
          <div
            className="flex-grow rounded-md border border-[var(--muji-border)] shadow-sm overflow-hidden relative bg-white/90"
          >
            {/* Wrap the content with TransformWrapper */}
            <TransformWrapper
              initialScale={1}
              minScale={0.1}
              maxScale={10}
              limitToBounds={false}
            >
              <TransformComponent
                wrapperStyle={{ width: '100%', height: '100%' }}
                contentStyle={{ width: '100%', height: '100%' }}
              >
                {/* Container for the SVG */}
                <div
                  className="p-4 mermaid-output-container flex items-center justify-center w-full h-full [&_svg]:max-w-none [&_svg]:h-auto"
                  dangerouslySetInnerHTML={{ __html: error ? `<pre class="text-[var(--muji-ink)] p-4">${error}</pre>` : svgOutput }}
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
          stroke-width: 0.5px !important; /* Even finer pen feel */
          vector-effect: non-scaling-stroke; /* Keep stroke width constant on zoom */
        }
        
        /* Style for text to match Muji typography */
        .mermaid-output-container text {
          font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif !important;
          font-size: 13px !important;
          fill: var(--muji-ink) !important;
        }
        
        /* Cluster/subgraph label background */
        .mermaid-output-container .cluster .cluster-label rect {
          fill: #F8F6F0 !important;
        }
        
        /* Node backgrounds - make them eggshell white instead of semi-transparent */
        .mermaid-output-container .node rect,
        .mermaid-output-container .node circle,
        .mermaid-output-container .node polygon {
          fill: #F8F6F0 !important;
        }
        
        /* Ensure all diagram elements with backgrounds have eggshell white */
        .mermaid-output-container .label rect,
        .mermaid-output-container .edgeLabel rect,
        .mermaid-output-container .labelBackground,
        .mermaid-output-container .note,
        .mermaid-output-container .marker {
          fill: #F8F6F0 !important;
        }
        
        /* Ensure labels are always readable by giving them an eggshell background */
        .mermaid-output-container .edgeLabel {
          background-color: #F8F6F0 !important;
          color: var(--muji-ink) !important;
        }
      `}</style>
    </main>
  );
}
