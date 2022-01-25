import React, { useState, useContext } from "react";

const MetaContext = React.createContext(null);

export const withMetadata = (Child) => (props) => {
  const [metadata, setMetadata] = useState(null);

  useState(() => {
    (async () => {
      const response = await fetch("/meta.json?hash=" + Date.now());
      const metadata = await response.json();
      setMetadata(metadata);
    })();
  }, []);

  if (!metadata) return null;

  return (
    <MetaContext.Provider value={metadata}>
      <Child {...props} />
    </MetaContext.Provider>
  );
};

export function useMetadata() {
  return useContext(MetaContext);
}
