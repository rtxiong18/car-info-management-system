import React, { useEffect, useState } from "react";
import {
  Button,
  Flex,
  Checkbox,
  Form,
  Input,
  Modal,
  Table,
  Dropdown,
  Space,
  Select,
  message,
  Layout,
  Tag,
} from "antd";
import NormalReportTable from "./NormalReportTable.js";
import "./ReportTable.css";

const BASIC_URL = "http://localhost:3301";

const MonthlyReportTable = ({ data }) => {
  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }

  const columns = Object.keys(data[0]); // Assuming the keys are consistent across all objects
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [monthlyReport, setMonthlyReport] = useState([]);

  const showModal = (SalesYear, SalesMonth) => {
    setIsModalOpen(true);
    try {
      fetch(
        `${BASIC_URL}/get_rpt_monthly_report_drilldown?SalesYear=${SalesYear}&SalesMonth=${SalesMonth}`
      )
        .then((response) => response.json())
        .then((monthlyReport) => setMonthlyReport(monthlyReport[1]));
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  return (
    <table className="report-table">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column}>{column}</th>
          ))}
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index}>
            {columns.map((column) => (
              <td key={column}>{row[column]}</td>
            ))}
            <td>
              {/* Add a button for drill down */}
              <Button
                type="primary"
                onClick={() => showModal(row.SalesYear, row.SalesMonth)}
              >
                Drill Down Report
              </Button>
              <Modal
                title="Basic Modal"
                open={isModalOpen}
                onOk={handleOk}
                onCancel={handleCancel}
                width={1000}
              >
                <NormalReportTable data={monthlyReport} />
              </Modal>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default MonthlyReportTable;
