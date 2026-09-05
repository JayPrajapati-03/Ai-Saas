import { createContext, useState, useContext } from "react";

const UsageContext = createContext();

export function UsageProvider({ children }) {
  const [usageCount, setUsageCount] = useState(0);

  const incrementUsage = () => {
    setUsageCount((prev) => prev + 1);
  };

  return (
    <UsageContext.Provider value={{ usageCount, incrementUsage }}>
      {children}
    </UsageContext.Provider>
  );
}

export function useUsage() {
  return useContext(UsageContext);
}
