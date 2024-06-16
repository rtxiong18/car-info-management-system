import "./ReportTable.css";
import React, { useEffect, useState } from "react";

const NormalReportTable = ({ data }) => {
  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }

  const columns = Object.keys(data[0]);
  const highlightClass = "highlighted-row";

  const tableContainerStyle = {
    maxHeight: "600px", // Adjust the height as needed
    overflowY: "auto", // Add a vertical scrollbar when necessary
  };

  return (
    <div style={tableContainerStyle}>
      <table className="report-table">
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column}>{column}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={index}
              style={{ backgroundColor: row.highlight_flag === "Y" ? "red" : "white"}}
              // style={row.highlight_flag === "Y" ? highlightClass : ""}
            >
              {columns.map((column) => (
                <td key={column}>{row[column]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default NormalReportTable;
