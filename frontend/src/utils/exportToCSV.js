export const exportToCSV = (filename, headers, data) => {
    const csvRows = [];
    
    // Add headers to the CSV rows
    csvRows.push(headers.join(","));
  
    // Add data rows to the CSV
    data.forEach(row => {
      csvRows.push(row.map(item => `"${item}"`).join(","));
    });
  
    // Create CSV string
    const csvString = csvRows.join("\n");
  
    // Create a Blob from the string and download the CSV file
    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.setAttribute("hidden", "");
    a.setAttribute("href", url);
    a.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
  