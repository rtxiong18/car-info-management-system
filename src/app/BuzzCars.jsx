"use client"; // This is a client component 👈🏽

import React, { useEffect, useState } from "react";
import MonthlyReportTable from "./MonthlyReportTable";
import NormalReportTable from "./NormalReportTable.js";
import { SearchOutlined } from "@ant-design/icons";
import moment from 'moment';

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
  Menu
} from "antd";

const BASIC_URL = "http://localhost:3301";

const BuzzCars = () => {
  // const [data, setData] = useState([]);
  // const [monthlyReport, setMonthlyReport] = useState([]);
  // const [sellerHist, setSellerHist] = useState([]);
  // const [avgDaysInv, setAvgDaysInv] = useState([]);
  // const [pricePerCond, setPricePerCond] = useState([]);
  // const [partStats, setPartStats] = useState([]);
  // const [availabelVehicles, setavailabelVehicles] = useState([]);
  // const [pendingVehicles, setpendinglVehicles] = useState([]);
  // const [populateVIN, setpopulateVIN] = useState([]);
  // const [populateVtype, setpopulateVtype] = useState([]);
  // const [populateYear, setpopulateYear] = useState([]);
  // const [populatefuel, setpopulatefuel] = useState([]);
  // const [populatemanufacturer, setpopulatemanufacturer] = useState([]);
  // const [populatecolor, setpopulatecolor] = useState([]);
  // const [selected, setSelected] = useState([]);
  // const [inventoryselected, setinventorySelected] = useState([]);

  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    get_filter_options();
  }, []);

  // Login button
  const [login, setLogin] = useState(false);
  // Inventory Clerk, Salesperson, Manager, Owner, false == logout

  const get_login = async (username, password) => {
    let url = `${BASIC_URL}/login?username=${username}&password=${password}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        messageApi.open({
          type: "error",
          content: "Failed to login.",
        });
        throw new Error(`HTTP Error: ${response.status}`);
      }

      messageApi.open({
        type: "success",
        content: "Login succeed! Welcom, " + username,
      });

      const data = await response.json();
      setLogin(data.role);
      setIsModalOpen(false);
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  const onLoginClick = (username, password) => {
    get_login(username, password);
  };

  const renderLogin = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const showModal = () => {
      setIsModalOpen(true);
    };
    const handleOk = () => {
      setIsModalOpen(false);
    };
    const handleCancel = () => {
      setIsModalOpen(false);
    };

    const onFinish = (values) => {
      onLoginClick(values.username, values.password);
    };

    const onFinishFailed = (errorInfo) => {
      console.log("Failed:", errorInfo);
    };

    const LoginModal = () => (
      <Form
        name="basic"
        labelCol={{
          span: 8,
        }}
        wrapperCol={{
          span: 16,
        }}
        style={{
          maxWidth: 600,
        }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          label="Username"
          name="username"
          rules={[
            {
              required: true,
              message: "Please input your username!",
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[
            {
              required: true,
              message: "Please input your password!",
            },
          ]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item
          wrapperCol={{
            offset: 8,
            span: 16,
          }}
        >
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    );

    return (
      <>
        {login === false ? (
          <>
            <Button
              type="primary"
              onClick={showModal}
              style={{ marginLeft: "20px" }}
            >
              Login
            </Button>
            <Modal
              title="Login"
              open={isModalOpen}
              onOk={handleOk}
              onCancel={handleCancel}
            >
              <LoginModal />
            </Modal>
          </>
        ) : (
          <Button
            type="primary"
            onClick={() => setLogin(false)}
            style={{ marginLeft: "20px" }}
          >
            {" "}
            Logout{" "}
          </Button>
        )}
      </>
    );
  };

  // Landing Page & Search
  const [landingPageSearchData, setLandingPageSearchData ] = useState(false);
  const [landingPageFilters, setLandingPageFilters ] = useState({
    vehicle_type: '',
    manufacturer: '',
    model_year: '',
    fuel_type: '',
    color: '',
    keyword: '',
    vin: '',
    sold: 'all'
  });
  const [
    landingPageFilterOptions_vehicle_type,
    setLandingPageFiltersOptions_vehicle_type,
  ] = useState([]);
  const [
    landingPageFilterOptions_manufacturer,
    setLandingPageFiltersOptions_manufacturer,
  ] = useState([]);
  const [
    landingPageFilterOptions_fuel_type,
    setLandingPageFiltersOptions_fuel_type,
  ] = useState([]);
  const [landingPageFilterOptions_color, setLandingPageFiltersOptions_color] =
    useState([]);

  const [landingPageVehicleDetails, setLandingPageVehicleDetails] =
    useState(null);

  const search = () => {
    if (landingPageFilters.model_year !== '' && (Number(landingPageFilters.model_year) < 1950 || Number(landingPageFilters.model_year) > 2024)) {
      messageApi.open({
        type: "warning",
        content:
          "Invalid model_year, please make sure it's between 1950 to 2024.",
      });
    } else {
      get_search_result();
    }
  };

  const get_search_result = async (
  ) => {
    const vehicleType = landingPageFilters.vehicle_type;
    const manufacturer = landingPageFilters.manufacturer;
    const modelYear = landingPageFilters.model_year;
    const fuelType = landingPageFilters.fuel_type;
    const color = landingPageFilters.color;
    const keyword = landingPageFilters.keyword;
    const vin = landingPageFilters.vin;

    let url = `${BASIC_URL}/get_public_search?vehicleType=${vehicleType}&manufacturer=${manufacturer}&modelYear=${modelYear}&fuelType=${fuelType}&color=${color}&keyword=${keyword}`;

    if (login === 'Inventory Clerk') {
      console.warn('Anna login Inventory Clerk');
    }
    switch (login) {
      case 'Salesperson':
        url = `${BASIC_URL}/get_previleged_search?vehicleType=${vehicleType}&manufacturer=${manufacturer}&modelYear=${modelYear}&fuelType=${fuelType}&color=${color}&vin=${vin}&keyword=${keyword}`;
        break;
      case 'Inventory Clerk':
        url = `${BASIC_URL}/get_inventory_search?vehicleType=${vehicleType}&manufacturer=${manufacturer}&modelYear=${modelYear}&fuelType=${fuelType}&color=${color}&vin=${vin}&keyword=${keyword}`;
        break;
      case 'Manager':
        if (landingPageFilters.sold === 'unsold') {
          url = `${BASIC_URL}/get_inventory_search?vehicleType=${vehicleType}&manufacturer=${manufacturer}&modelYear=${modelYear}&fuelType=${fuelType}&color=${color}&vin=${vin}&keyword=${keyword}`;
        } else if (landingPageFilters.sold === 'sold') {
          url = `${BASIC_URL}/get_sold_search?vehicleType=${vehicleType}&manufacturer=${manufacturer}&modelYear=${modelYear}&fuelType=${fuelType}&color=${color}&vin=${vin}&keyword=${keyword}`;
        } else {
          url = `${BASIC_URL}/get_all_search?vehicleType=${vehicleType}&manufacturer=${manufacturer}&modelYear=${modelYear}&fuelType=${fuelType}&color=${color}&vin=${vin}&keyword=${keyword}`;
        }
        break;
      case 'Owner':
        if (landingPageFilters.sold === 'unsold') {
          url = `${BASIC_URL}/get_inventory_search?vehicleType=${vehicleType}&manufacturer=${manufacturer}&modelYear=${modelYear}&fuelType=${fuelType}&color=${color}&vin=${vin}&keyword=${keyword}`;
        } else if (landingPageFilters.sold === 'sold') {
          url = `${BASIC_URL}/get_sold_search?vehicleType=${vehicleType}&manufacturer=${manufacturer}&modelYear=${modelYear}&fuelType=${fuelType}&color=${color}&vin=${vin}&keyword=${keyword}`;
        } else {
          url = `${BASIC_URL}/get_all_search?vehicleType=${vehicleType}&manufacturer=${manufacturer}&modelYear=${modelYear}&fuelType=${fuelType}&color=${color}&vin=${vin}&keyword=${keyword}`;
        }
        break;
      default:
        url = `${BASIC_URL}/get_public_search?vehicleType=${vehicleType}&manufacturer=${manufacturer}&modelYear=${modelYear}&fuelType=${fuelType}&color=${color}&keyword=${keyword}`;
    }

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      if (data.length >= 2 && Array.isArray(data[1])) {
        setLandingPageSearchData(data[1]);
      } else {
        setLandingPageSearchData(data);
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  const get_filter_options = () => {
    fetch(`${BASIC_URL}/get_vehicle_type`)
      .then((response) => response.json())
      .then((populateVtype) =>
        setLandingPageFiltersOptions_vehicle_type([
          "",
          ...populateVtype[1].map((each) => each.vehicle_type),
        ])
      );

    fetch(`${BASIC_URL}/get_manufacturer`)
      .then((response) => response.json())
      .then((populateVtype) =>
        setLandingPageFiltersOptions_manufacturer([
          "",
          ...populateVtype[1].map((each) => each.manufacturer),
        ])
      );

    fetch(`${BASIC_URL}/get_color`)
      .then((response) => response.json())
      .then((populateVtype) =>
        setLandingPageFiltersOptions_color([
          "",
          ...populateVtype[1].map((each) => each.color),
        ])
      );

    fetch(`${BASIC_URL}/get_fuel_type`)
      .then((response) => response.json())
      .then((populateVtype) =>
        setLandingPageFiltersOptions_fuel_type([
          "",
          ...populateVtype[1].map((each) => each.fuel_type),
        ])
      );
  };

  const get_vehicle_details = async (vin) => {
    try {
      let url = `${BASIC_URL}/get_selected?vin=${vin}`;
      if (login === 'Inventory Clerk') {
        url = `${BASIC_URL}/get_inventory_selected?vin=${vin}`;
      } else if (login === 'Manager') {
        url = `${BASIC_URL}/get_manager_selected?vin=${vin}`;
      }
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      const data = await response.json();
      setLandingPageVehicleDetails(data[1]);
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const renderDetails = (vin) => {
    const showModal = () => {
      setIsDetailsOpen(true);
    };
    const handleOk = () => {
      setIsDetailsOpen(false);
    };
    const handleCancel = () => {
      setIsDetailsOpen(false);
    };

    return (
      <>
        <Button
          type="primary"
          onClick={() => {
            showModal();
            get_vehicle_details(vin);
          }}
        >
          View Details
        </Button>
        <Modal
          title="Details"
          open={isDetailsOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          width={'100%'}
        >
          {landingPageVehicleDetails && landingPageVehicleDetails.length > 0 ? (
            <>
              { Object.keys(landingPageVehicleDetails[0]).includes("VIN") && <div>VIN: {landingPageVehicleDetails[0].VIN}</div> }
              { Object.keys(landingPageVehicleDetails[0]).includes("vehicle_type") && <div>
                Vehicle type: {landingPageVehicleDetails[0].vehicle_type}
              </div> }
              { Object.keys(landingPageVehicleDetails[0]).includes("manufacturer") && <div>
                Manufacturer: {landingPageVehicleDetails[0].manufacturer} </div> }
              { Object.keys(landingPageVehicleDetails[0]).includes("model_name") && <div>Model name: {landingPageVehicleDetails[0].model_name}</div> }
              { Object.keys(landingPageVehicleDetails[0]).includes("model_year") && <div>Model year: {landingPageVehicleDetails[0].model_year}</div> }
              { Object.keys(landingPageVehicleDetails[0]).includes("fuel_type") && <div>Fuel type: {landingPageVehicleDetails[0].fuel_type}</div> }
              { Object.keys(landingPageVehicleDetails[0]).includes("color") && <div>Color(s): {landingPageVehicleDetails[0].color}</div> }
              { Object.keys(landingPageVehicleDetails[0]).includes("milege") && <div>Mileage: {landingPageVehicleDetails[0].milege}</div> }
              { Object.keys(landingPageVehicleDetails[0]).includes("sale_price") && <div>Sales price: {landingPageVehicleDetails[0].sale_price}</div> }
              { Object.keys(landingPageVehicleDetails[0]).includes("sale_date") && <div>Sales date: {landingPageVehicleDetails[0].sale_date}</div> }
              { Object.keys(landingPageVehicleDetails[0]).includes("purchase_price") && <div>Purchase price: {landingPageVehicleDetails[0].purchase_price}</div> }
              { Object.keys(landingPageVehicleDetails[0]).includes("purchase_date") && <div>Purchase date: {landingPageVehicleDetails[0].purchase_date}</div> }
              { Object.keys(landingPageVehicleDetails[0]).includes("total_part_cost") && <div>Total part cost: {landingPageVehicleDetails[0].total_part_cost}</div> }
              { Object.keys(landingPageVehicleDetails[0]).includes("description") && <div>Description: {landingPageVehicleDetails[0].description}</div> }
              { Object.keys(landingPageVehicleDetails[0]).includes("inventory_clerk_first_name") && <div>Inventory clerk first name: {landingPageVehicleDetails[0].inventory_clerk_first_name}</div> }
              { Object.keys(landingPageVehicleDetails[0]).includes("inventory_clerk_last_name") && <div>Inventory clerk last name: {landingPageVehicleDetails[0].inventory_clerk_last_name}</div> }
              { Object.keys(landingPageVehicleDetails[0]).includes("seller_company") && <div>Seller company: {landingPageVehicleDetails[0].seller_company}</div> }
              { Object.keys(landingPageVehicleDetails[0]).includes("seller_title") && <div>Seller title: {landingPageVehicleDetails[0].seller_title}</div> }
              { Object.keys(landingPageVehicleDetails[0]).includes("seller_first_name") && <div>Seller first name: {landingPageVehicleDetails[0].seller_first_name}</div> }
              { Object.keys(landingPageVehicleDetails[0]).includes("seller_last_name") && <div>Seller last name: {landingPageVehicleDetails[0].seller_last_name}</div> }
              { Object.keys(landingPageVehicleDetails[0]).includes("buyer_company") && <div>{
                (landingPageVehicleDetails[0].buyer_company ||
                landingPageVehicleDetails[0].buyer_title ||
                landingPageVehicleDetails[0].buyer_first_name ||
                landingPageVehicleDetails[0].buyer_last_name) 
                 ? "Car: Sold" : "Car: Unsold"
              }</div>
              }
              { Object.keys(landingPageVehicleDetails[0]).includes("buyer_company") && <div>Buyer company: {landingPageVehicleDetails[0].buyer_company}</div> }
              { Object.keys(landingPageVehicleDetails[0]).includes("buyer_title") && <div>Buyer title: {landingPageVehicleDetails[0].buyer_title}</div> }
              { Object.keys(landingPageVehicleDetails[0]).includes("buyer_first_name") && <div>Buyer first name: {landingPageVehicleDetails[0].buyer_first_name}</div> }
              { Object.keys(landingPageVehicleDetails[0]).includes("buyer_last_name") && <div>Buyer last name: {landingPageVehicleDetails[0].buyer_last_name}</div> }
              
              {(login === "Salesperson" || login === "Owner") && (
                <Button
                  type="primary"
                  htmlType="submit"
                  onClick={() => {
                    setUpdateCarData({
                      ...landingPageVehicleDetails[0],
                      sale_date: convertDateToStr(
                        landingPageVehicleDetails[0].sale_date
                      ),
                      purchase_date: convertDateToStr(
                        landingPageVehicleDetails[0].purchase_date
                      ),
                    });
                    setIsDetailsOpen(false);
                  }}
                >
                  {" "}
                  Sell Car{" "}
                </Button>
              )}
              {
                login === "Manager" &&
                render_view_parts_order_for_manager(landingPageVehicleDetails[0].VIN)
              }
            </>
          ) : (
            "Sorry, couldn't find any details."
          )}
        </Modal>
      </>
    );
  };

  const renderLandingPage = () => {
    const columns = [
      {
        title: "VIN",
        dataIndex: "VIN",
        key: "VIN",
        render: (text) => text,
      },
      {
        title: "",
        dataIndex: "VIN",
        key: "VIN",
        render: (text) => renderDetails(text),
      },
    ];

    const renderFilters = (
      <div>
        <Space align="center">
          <Select
            placeholder="vehicle_type"
            options={landingPageFilterOptions_vehicle_type.map((e) => ({
              value: e,
              label: e,
            }))}
            onChange={(value) =>
              setLandingPageFilters({
                ...landingPageFilters,
                vehicle_type: value,
              })
            }
          />
          <Select
            placeholder="manufacturer"
            options={landingPageFilterOptions_manufacturer.map((e) => ({
              value: e,
              label: e,
            }))}
            onChange={(value) =>
              setLandingPageFilters({
                ...landingPageFilters,
                manufacturer: value,
              })
            }
          />
          <Input
            placeholder="model_year"
            onChange={(e) => {
              setLandingPageFilters({
                ...landingPageFilters,
                model_year: e.target.value,
              });
            }}
          />
          <Select
            placeholder="fuel_type"
            options={landingPageFilterOptions_fuel_type.map((e) => ({
              value: e,
              label: e,
            }))}
            onChange={(value) =>
              setLandingPageFilters({ ...landingPageFilters, fuel_type: value })
            }
          />
          <Select
            placeholder="color"
            options={landingPageFilterOptions_color.map((e) => ({
              value: e,
              label: e,
            }))}
            onChange={(value) =>
              setLandingPageFilters({ ...landingPageFilters, color: value })
            }
          />
          <Input placeholder="keyword" onChange={e => {
            setLandingPageFilters({ ...landingPageFilters, keyword: e.target.value});
          }}/>
          {
            login &&
            <Input placeholder="VIN" onChange={e => {
              setLandingPageFilters({ ...landingPageFilters, vin: e.target.value});
            }}/>
          }
          {
            (login === 'Manager' || login === 'Owner') &&
            <Select
              placeholder="sold/unsold"
              options={[{ value: 'sold', label: 'sold'}, { value: 'unsold', label: 'unsold'}, { value: 'all', label: 'all'}]}
              onChange={value => setLandingPageFilters({ ...landingPageFilters, sold: value})}
            />
          }
          <Button type="primary" htmlType="submit" onClick={() => search()}> Search </Button>
        </Space>
      </div>
    );

    return (
      <>
        { contextHolder }
        <div>{!login ? "Public" : login} Search</div>
        {
          renderFilters
        }
        <div>Total number of cars: {landingPageSearchData.length}</div>
        {
          landingPageSearchData && <Table columns={columns} dataSource={landingPageSearchData} locale={{ emptyText: 'Sorry, it looks like we don’t have that in stock!' }}/>
        }
      </>
    );
  };

  // search customer
  const { Search } = Input;
  const [data, setData] = useState([]);
  const [inputText, setInputText] = useState("");
  const [searchClicked, setSearchClicked] = useState(false);
  useEffect(() => {
    // Check if the inputText matches drivers_license
    if (inputText) {
      fetch(`${BASIC_URL}/search_customer_person/${inputText}`)
        .then((response) => response.json())
        .then((data) => setData(data[1]));
    }
  }, [inputText]); // Only re-run the effect when inputText changes
  const render_customer_search_person = () => {
    const handleInputChange = (event) => {
      setInputText(event.target.value);
    };

    // Define a function to handle the search icon click
    const handleSearchIconClick = () => {
      // Set searchClicked to true to trigger rendering of NormalReportTable
      setSearchClicked(true);
    };

    return (
      <Space direction="vertical" size="middle">
        <Space.Compact size="large">
          <Input
            addonBefore={
              <SearchOutlined
                onClick={handleSearchIconClick}
                style={{ cursor: "pointer" }}
              />
            }
            placeholder="#Driver's License"
            onChange={handleInputChange} // Update inputText on change
          />
        </Space.Compact>

        {/* Conditionally render NormalReportTable when data is available */}
        {searchClicked && <NormalReportTable data={data} />}
      </Space>
    );
  };


  // search business
  const [dataBusiness, setDataBusiness] = useState([]);
  const [inputTextBusiness, setInputTextBusiness] = useState("");
  const [searchClickedBusiness, setSearchClickedBusiness] = useState(false);
  useEffect(() => {
    // Check if the inputText matches drivers_license
    if (inputTextBusiness) {
      fetch(`${BASIC_URL}/search_customer_business/${inputTextBusiness}`)
        .then((response) => response.json())
        .then((data) => setDataBusiness(data[1]));
    }
  }, [inputTextBusiness]); // Only re-run the effect when inputText changes
  const render_customer_search_business = () => {
    const handleInputChange = (event) => {
      setInputTextBusiness(event.target.value);
    };

    // Define a function to handle the search icon click
    const handleSearchIconClick = () => {
      // Set searchClicked to true to trigger rendering of NormalReportTable
      setSearchClickedBusiness(true);
    };

    return (
      <Space direction="vertical" size="middle">
        <Space.Compact size="large">
          <Input
            addonBefore={
              <SearchOutlined
                onClick={handleSearchIconClick}
                style={{ cursor: "pointer" }}
              />
            }
            placeholder="#Tax ID"
            onChange={handleInputChange} // Update inputText on change
          />
        </Space.Compact>

        {/* Conditionally render NormalReportTable when data is available */}
        {searchClickedBusiness && <NormalReportTable data={dataBusiness} />}
      </Space>
    );
  };

  //other buttons on customer search page
  const [partOrderForm, setPartOrderForm] = useState(false);
  const [viewVendor, setViewVendor] = useState(false);
  const BtnCustomerSearchPage = () => (
    <Flex
      vertical
      gap="large"
      style={{
        width: "30%",
      }}
    >
      {AddIndividualCustomerBtn()}
      {AddBusinessCustomerBtn()}
      {AddVehicleBtn()}
      <Button type="primary" onClick={() => setViewVendor(true)}>
        View Vendor
      </Button>
      <Button type="primary" onClick={() => setPartOrderForm(true)}>
        Part Order Form
      </Button>
    </Flex>
  );

  const renderAddVechilePage = () => {
    return (
      <>
        {partOrderForm ? (
          <div>
            <h1>Part Order Form</h1>
            {render_view_parts_order()}
            {btnsSearchPartsOrder()}
          </div>
        ) : viewVendor ? (
          <div>
            <h1>View Vendor</h1>
            {renderVendorPage()}
          </div>
        ) : (
          <div
            style={{
              minHeight: "100vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div style={{ margin: "20px 20px 50px 20px" }}>
              {render_customer_search_person()}
              {render_customer_search_business()}
            </div>
            <div>{BtnCustomerSearchPage()}</div>
          </div>
        )}
      </>
    );
  };

  // Update car botton
  const convertDateToStr = (date) =>
    date ? moment(date).format("YYYY-MM-DD") : "";
  const convertStrToDate = (str) => str;
  const [updateCarData, setUpdateCarData] = useState(null);
  const update_vehicle_details = async ()=>{
    const VIN = updateCarData.VIN;
    const fuel_type = updateCarData.fuel_type;
    const model_name = updateCarData.model_name;
    const model_year = updateCarData.model_year;
    const description = updateCarData.description;
    const milege = updateCarData.milege;
    const manufacturer = updateCarData.manufacturer;
    const salesperson_username = updateCarData.salesperson_username;
    const condition = updateCarData.condition;
    const purchase_date = updateCarData.purchase_date;
    const purchase_price= updateCarData.purchase_price;
    const inventory_clerk_username = updateCarData.inventory_clerk_username;
    const sale_date = updateCarData.sale_date;
    const vehicle_type = updateCarData.vehicle_type;
    const customer_username = updateCarData.customer_username;
    const seller = updateCarData.seller;

    let url = `${BASIC_URL}/edit_vehicle_profile/${VIN}?fuel_type=${fuel_type}&model_name=${model_name}&model_year=${model_year}&description=${description}&milege=${milege}&manufacturer=${manufacturer}&salesperson_username=${salesperson_username}&condition=${condition}&purchase_date=${purchase_date}&purchase_price=${purchase_price}&inventory_clear_username=${inventory_clerk_username}&sale_date=${sale_date}&vehicle_type=${vehicle_type}&customer_username=${customer_username}&seller=${seller}`;

    try {
      const response = await fetch(url);

      if (!response.ok) {
        messageApi.open({
          type: "error",
          content: response.text(),
        });
        throw new Error(`HTTP Error: ${response.status}`);
      }

      setIsModalOpenUpdateCar(false);
      messageApi.open({
        type: "success",
        content: "Update succeed!",
      });

      // const data = await response.json();
      // setLandingPageSearchData(data[1]);
      // console.log(data[1]);
    } catch (error) {
      console.error("An error occurred:", error);
    }
  }
  const [isModalOpenUpdateCar, setIsModalOpenUpdateCar] = useState(false);
  const renderUpdateCarBtn = () => {
    const showModal = () => {
      setIsModalOpenUpdateCar(true);
    };
    const handleOk = () => {
      setIsModalOpenUpdateCar(false);
    };
    const handleCancel = () => {
      setIsModalOpenUpdateCar(false);
    };

    return (
      <>
        <Button type="primary" onClick={showModal} disabled={!updateCarData}>
          Add Sale Date (Update Vehicle)
        </Button>
        <Modal
          title="Update Car Info"
          open={isModalOpenUpdateCar}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          <Input
            size="default size"
            placeholder="VIN"
            defaultValue={
              updateCarData && updateCarData.VIN ? updateCarData.VIN : ""
            }
            style={{ width: 200 }}
            disabled={true}
            onChange={(e) =>
              setUpdateCarData({
                ...updateCarData,
                VIN: e.target.value,
              })
            }/>
          <br />
          <br />
          <Select
            placeholder="fuel_type"
            options={landingPageFilterOptions_fuel_type.map((e) => ({
              value: e,
              label: e,
            }))}
            defaultValue={
              updateCarData && updateCarData.fuel_type
                ? updateCarData.fuel_type
                : ""
            }
            onChange={(value) =>
              setUpdateCarData({
                ...updateCarData,
                fuel_type: e.target.value,
              })
            }/>
          <br />
          <br />
          <Input
            size="default size"
            placeholder="model_year"
            defaultValue={
              updateCarData && updateCarData.model_year
                ? updateCarData.model_year
                : ""
            }
            style={{ width: 200 }}
            onChange={(e) =>
              setUpdateCarData({
                ...updateCarData,
                model_year: e.target.value,
              })
            }/>
          <br />
          <br />
          <Input
            size="default size"
            placeholder="description"
            defaultValue={
              updateCarData && updateCarData.description
                ? updateCarData.description
                : ""
            }
            style={{ width: 200 }}
            onChange={(e) =>
              setUpdateCarData({
                ...updateCarData,
                description: e.target.value,
              })
            }/>
          <br />
          <br />
          <Input
            size="default size"
            placeholder="milege"
            defaultValue={
              updateCarData && updateCarData.milege ? updateCarData.milege : ""
            }
            style={{ width: 200 }}
            onChange={(e) =>
              setUpdateCarData({
                ...updateCarData,
                milege: e.target.value,
              })
            }/>
          <br />
          <br />
          <Select
            placeholder="manufacturer"
            options={landingPageFilterOptions_manufacturer.map((e) => ({
              value: e,
              label: e,
            }))}
            defaultValue={
              updateCarData && updateCarData.manufacturer
                ? updateCarData.manufacturer
                : ""
            }
            onChange={(value) =>
              setUpdateCarData({
                ...updateCarData,
                manufacturer: e.target.value,
              })
            }/>
          <br />
          <br />
          <Input
            size="default size"
            placeholder="salesperson_username"
            defaultValue={
              updateCarData && updateCarData.salesperson_username
                ? updateCarData.salesperson_username
                : ""
            }
            style={{ width: 200 }}
            onChange={(e) =>
              setUpdateCarData({
                ...updateCarData,
                salesperson_username: e.target.value,
              })
            }/>
          <br />
          <br />
          <Select
            placeholder="condition"
            options={[
              {
                value: '',
                label: '',
              },
              {
                value: 'Excellent',
                label: 'Excellent',
              },
              {
                value: 'Very Good',
                label: 'Very Good',
              },
              {
                value: 'Good',
                label: 'Good',
              },
              {
                value: 'Fair',
                label: 'Fair',
              }
            ]}
            defaultValue={
              updateCarData && updateCarData.condition
                ? updateCarData.condition
                : ""
            }
            onChange={(e) =>
              setUpdateCarData({
                ...updateCarData,
                condition: e.target.value,
              })
            }/>
          <br />
          <br />
          purchase date{" "}
          <Input
            size="default size"
            type="date"
            placeholder="purchase_date"
            defaultValue={
              updateCarData && updateCarData.purchase_date
                ? updateCarData.purchase_date
                : ""
            }
            style={{ width: 200 }}
            onChange={(e) =>
              setUpdateCarData({
                ...updateCarData,
                purchase_date: e.target.value,
              })
            }/>
          <br />
          <br />
          <Input
            size="default size"
            placeholder="purchase_price"
            defaultValue={
              updateCarData && updateCarData.purchase_price
                ? updateCarData.purchase_price
                : ""
            }
            style={{ width: 200 }}
            onChange={(e) =>
              setUpdateCarData({
                ...updateCarData,
                purchase_price: e.target.value,
              })
            }/>
          <br />
          <br />
          <Input
            size="default size"
            placeholder="inventory_clerk_username"
            defaultValue={
              updateCarData && updateCarData.inventory_clerk_username
                ? updateCarData.inventory_clerk_username
                : ""
            }
            style={{ width: 200 }}
            onChange={(e) =>
              setUpdateCarData({
                ...updateCarData,
                inventory_clerk_username: e.target.value,
              })
            }/>
          <br />
          <br />
          sale date{" "}
          <Input
            size="default size"
            type="date"
            placeholder="sale_date"
            defaultValue={
              updateCarData && updateCarData.sale_date
                ? updateCarData.sale_date
                : ""
            }
            style={{ width: 200 }}
            onChange={(e) =>
              setUpdateCarData({
                ...updateCarData,
                sale_date: e.target.value,
              })
            }/>
          <br />
          <br />
          sale price{" "}
          <Input
            size="default size"
            type="text"
            placeholder="sale_date"
            defaultValue={
              updateCarData && updateCarData.sale_price
                ? updateCarData.sale_price
                : ""
            }
            style={{ width: 200 }}
            disabled={true}/>
          <br />
          <br />
          <Select
            placeholder="vehicle_type"
            options={landingPageFilterOptions_vehicle_type.map((e) => ({
              value: e,
              label: e,
            }))}
            defaultValue={
              updateCarData && updateCarData.vehicle_type
                ? updateCarData.vehicle_type
                : ""
            }
            onChange={(e) =>
              setUpdateCarData({
                ...updateCarData,
                vehicle_type: e.target.value,
              })
            }/>
          <br />
          <br />
          <Input
            size="default size"
            placeholder="customer_username"
            defaultValue={
              updateCarData && updateCarData.customer_username
                ? updateCarData.customer_username
                : ""
            }
            style={{ width: 200 }}
            onChange={(e) =>
              setUpdateCarData({
                ...updateCarData,
                customer_username: e.target.value,
              })
            }/>
          <br />
          <br />
          <Input
            size="default size"
            placeholder="seller"
            defaultValue={
              updateCarData && updateCarData.seller ? updateCarData.seller : ""
            }
            style={{ width: 200 }}
            onChange={(e) =>
              setUpdateCarData({
                ...updateCarData,
                seller: e.target.value,
              })
            }/>
          <br />
          <br />
          <Button type="primary" onClick={() => update_vehicle_details()}>Add</Button>
        </Modal>
      </>
    );
  };

  //other buttons on sell cars page
  const BtnSellCarPage = () => (
    <Flex
      vertical
      gap="large"
      style={{
        width: "30%",
      }}
    >
      {AddBusinessCustomerBtn()}
      {AddIndividualCustomerBtn()}
      {renderUpdateCarBtn()}
    </Flex>
  );

  const renderSellCarPage = () => {
    return (
      <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div> Sell Car VIN: { updateCarData ? updateCarData.VIN : 'Not avaliable, please select a car.'} </div>
          <div style={{ margin: '20px 20px 50px 20px' }}>
            {render_customer_search_person()}
            {render_customer_search_business()}
          </div>
          <div>{BtnSellCarPage()}</div>
        </div>
    );
  };

  // Report View
  const [showMonthlyReport, setShowMonthlyReport] = useState(false);
  const [monthlyReport, setMonthlyReport] = useState([]);

  const [showSellerHistReport, setShowSellerHistReport] = useState(false);
  const [sellerHist, setSellerHist] = useState([]);

  const [showoAvgDaysInv, setShowAvgDaysInv] = useState(false);
  const [avgDaysInv, setAvgDaysInv] = useState([]);

  const [showPricePerCond, setShowPricePerCond] = useState(false);
  const [pricePerCond, setPricePerCond] = useState([]);

  const [showPartStats, setShowPartStats] = useState(false);
  const [partStats, setPartStats] = useState([]);

  //monthly report
  useEffect(() => {
    if (showMonthlyReport) {
      fetch(`${BASIC_URL}/get_rpt_monthly_report_summary`)
        .then((response) => response.json())
        .then((data) => setMonthlyReport(data[1]));
    }
  }, [showMonthlyReport]);

  //seller history
  useEffect(() => {
    if (showSellerHistReport) {
      fetch(`${BASIC_URL}/get_rpt_seller_hist`)
        .then((response) => response.json())
        .then((data) => setSellerHist(data[1]));
    }
  }, [showSellerHistReport]);

  //avg time in inventory
  useEffect(() => {
    if (showoAvgDaysInv) {
      fetch(`${BASIC_URL}/get_rpt_avgdays_inventory`)
        .then((response) => response.json())
        .then((data) => setAvgDaysInv(data[1]));
    }
  }, [showoAvgDaysInv]);

  //price per condition
  useEffect(() => {
    if (showPricePerCond) {
      fetch(`${BASIC_URL}/get_rpt_price_by_cond`)
        .then((response) => response.json())
        .then((data) => setPricePerCond(data[1]));
    }
  }, [showPricePerCond]);

  //part statistics
  useEffect(() => {
    if (showPartStats) {
      fetch(`${BASIC_URL}/get_rpt_part_stats`)
        .then((response) => response.json())
        .then((data) => setPartStats(data[1]));
    }
  }, [showPartStats]);

  const renderReportPage = () => {

    const handleMonthlyReportClick = () => {
      setShowMonthlyReport(true);
    };

    const handleSellerHistReportClick = () => {
      setShowSellerHistReport(true);
    };

    const handleAvgTimeInvReportClick = () => {
      setShowAvgDaysInv(true);
    };

    const handlePricePerCondReportClick = () => {
      setShowPricePerCond(true);
    };

    const handlePartStatisticsReportClick = () => {
      setShowPartStats(true);
    };

    //TODO for monthly report drilldown:
    const handleDrillDown = (rowData) => {
      // Implement the drill-down logic here
      console.log("Drill Down clicked for row:", rowData);
    };

    const rptBtns = (
      <Flex gap="small" wrap="wrap">
        <Button
          type="primary"
          className="button"
          onClick={handleMonthlyReportClick}
        >
          Monthly Sales Report
        </Button>
        <Button
          type="primary"
          className="button"
          onClick={handleSellerHistReportClick}
        >
          Seller History Report
        </Button>
        <Button
          type="primary"
          className="button"
          onClick={handleAvgTimeInvReportClick}
        >
          Average Days in Inventory Report
        </Button>
        <Button
          type="primary"
          className="button"
          onClick={handlePricePerCondReportClick}
        >
          Price per Condition Report
        </Button>
        <Button
          type="primary"
          className="button"
          onClick={handlePartStatisticsReportClick}
        >
          Part Statistics Report
        </Button>
      </Flex>
    );

    const backBtn = (
      <div>
        <Button
          type="primary"
          className="button"
          onClick={() => {
            setShowMonthlyReport(false);
            setShowAvgDaysInv(false);
            setShowPartStats(false);
            setShowPricePerCond(false);
            setShowSellerHistReport(false);
          }}
        >
          Back
        </Button>
      </div>
    );

    return (
      <div>
        <h1>View Report</h1>
        {showMonthlyReport ? (
          <div>
            <h1>Monthly Sales Report</h1>
            {
              backBtn
            }
            <MonthlyReportTable data={monthlyReport} />
          </div>
        ) : showSellerHistReport ? (
          <div>
            <h1>Seller History Report</h1>
            {
              backBtn
            }
            <NormalReportTable data={sellerHist} />
          </div>
        ) : showoAvgDaysInv ? (
          <div>
            <h1>Average Days in Inventory Report</h1>
            {
              backBtn
            }
            <NormalReportTable data={avgDaysInv} />
          </div>
        ) : showPricePerCond ? (
          <div>
            <h1>Price per Condition Report</h1>
            {
              backBtn
            }
            <NormalReportTable data={pricePerCond} />
          </div>
        ) : showPartStats ? (
          <div>
            <h1>Part Statistics Report</h1>
            {
              backBtn
            }
            <NormalReportTable data={partStats} />
          </div>
        ) : (
          <>{rptBtns}</>
        )}
      </div>
    );
  };

  // search parts order
  const [data_render_view_parts_order, setData_render_view_parts_order] =
    useState([]);
  const [
    inputText_render_view_parts_order,
    setInputText_render_view_parts_order,
  ] = useState("");
  const [
    searchClicked_render_view_parts_order,
    setSearchClicked_render_view_parts_order,
  ] = useState(false);
  useEffect(() => {
    // Check if the inputText matches purchase_order_number
    if (inputText_render_view_parts_order) {
      fetch(`${BASIC_URL}/get_parts_order/${inputText_render_view_parts_order}`)
        .then((response) => response.json())
        .then((data) => setData_render_view_parts_order(data[1]));
    }
  }, [inputText_render_view_parts_order]);
  // search parts order
  const render_view_parts_order = () => {
    const handleInputChange = (event) => {
      setInputText_render_view_parts_order(event.target.value);
    };

    // Define a function to handle the search icon click
    const handleSearchIconClick = () => {
      // Set searchClicked to true to trigger rendering of NormalReportTable
      setSearchClicked_render_view_parts_order(true);
    };

    return (
      <Space direction="vertical" size="middle">
        <Space.Compact size="large">
          <Input
            addonBefore={
              <SearchOutlined
                onClick={handleSearchIconClick}
                style={{ cursor: "pointer" }}
              />
            }
            placeholder="parts order number"
            onChange={handleInputChange} // Update inputText on change
          />
          <Input
          addonBefore={
            <SearchOutlined
              onClick={handleSearchIconClick}
              style={{ cursor: "pointer" }}
            />
          }
          placeholder="VIN"
          onChange={handleInputChange} // Update inputText on change
        />
        </Space.Compact>

        {/* Conditionally render NormalReportTable when data is available */}
        {searchClicked_render_view_parts_order && (
          <NormalReportTable data={data_render_view_parts_order} />
        )}
      </Space>




    );
  };

  // search parts order for manager
  const render_view_parts_order_for_manager = (vin) => {
    setInputText_render_view_parts_order(vin);
    return (
      <Space direction="vertical" size="middle">
        {/* Conditionally render NormalReportTable when data is available */}
        {(
          <NormalReportTable data={data_render_view_parts_order} />
        )}
      </Space>
    );
  };
  

  //other buttons on view parts order page
  const btnsSearchPartsOrder = () => {
    return (
      <>
        <Flex gap="small" align="flex-start" vertical>
          <Flex gap="small" wrap="wrap">
            {AddPartsOrderFormBtn()}
            {AddPartsBtn()}
            {UpdatePartStatusBtn()}
            <Button type="primary" onClick={() => setPartOrderForm(false)}>
              Back
            </Button>
          </Flex>
        </Flex>
      </>
    );
  };

  // add part order page
  const { Option } = Select;
  const [formData, setFormData] = useState({
    vendor_name: "", // Initialize with empty values
    purchase_order_number: "",
    VIN: "",
  });

  //example: http://localhost:3301/add_parts_order?vendor_name=Bioholding&purchase_order_number=999&VIN=036EG6XGHFJ822528
  const submitForm = (formData) => {
    fetch(
      `${BASIC_URL}/add_parts_order?vendor_name=${formData.vendor_name}&purchase_order_number=${formData.purchase_order_number}&VIN=${formData.VIN}`,
      {
        method: "POST",
        body: JSON.stringify({
          vendor_name: formData.vendor_name,
          purchase_order_number: formData.purchase_order_number,
          VIN: formData.VIN,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => {
        // if (response.status === 200) {
        //   return response.json().then((data) => {
        //     console.log("Add part order sucessfully!", data);
        //     alert("Part order added successfully");
        //   });
        // } else {
        //   console.error("Request failed with status:", response.status);
        //   alert("An error occurred while adding the part order");
        // }
        if (!response.ok) {
            messageApi.open({
              type: "error",
              content: response.text(),
            });
            throw new Error(`HTTP Error: ${response.status}`);
          }

          messageApi.open({
            type: "success",
            content: "Add part order succeed!",
          });
      })
      .catch((error) => {
        console.error("An error occurred:", error);
      });
  };

  const AddPartsOrderForm = () => {
    const onFinish = (values) => {
      //   console.log("Success:", values);
      // Make the API call using the values from formData
      submitForm(formData);
    };
    const onFinishFailed = (errorInfo) => {
      console.log("Failed:", errorInfo);
    };

    return (
      <Form
        name="basic"
        labelCol={{
          span: 8,
        }}
        wrapperCol={{
          span: 16,
        }}
        style={{
          maxWidth: 600,
        }}
        initialValues={{
          remember: true,
        }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          label="Vendor Name"
          name="vendor_name"
          placeholder="Vendor Name"
        >
          <Select
            allowClear
            value={formData.vendor_name}
            onChange={(value) =>
              setFormData({ ...formData, vendor_name: value })
            }
          >
            <Option value="Bioholding">Bioholding</Option>
            <Option value="Doncon">Doncon</Option>
            <Option value="Donquadtech">Donquadtech</Option>
            <Option value="Dontechi">Dontechi</Option>
            <Option value="Donware">Donware</Option>
            <Option value="Faxquote">Faxquote</Option>
            <Option value="Green-Plus">Green-Plus</Option>
            <Option value="Isdom">Isdom</Option>
            <Option value="J-Texon">J-Texon</Option>
            <Option value="Konmatfix">Konmatfix</Option>
            <Option value="Newex">Newex</Option>
            <Option value="Ontomedia">Ontomedia</Option>
            <Option value="Plusstrip">Plusstrip</Option>
            <Option value="Rundofase">Rundofase</Option>
            <Option value="Scotfind">Scotfind</Option>
            <Option value="Stanredtax">Stanredtax</Option>
            <Option value="Streethex">Streethex</Option>
            <Option value="Sumace">Sumace</Option>
            <Option value="Xx-zobam">Xx-zobam</Option>
            <Option value="Yearin">Yearin</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Part Order Number"
          name="purchase_order_number"
          placeholder="Part Order Number"
        >
          <Input
            value={formData.purchase_order_number}
            onChange={(e) =>
              setFormData({
                ...formData,
                purchase_order_number: e.target.value,
              })
            }
          />
        </Form.Item>

        <Form.Item label="VIN" name="VIN" placeholder="VIN">
          <Input
            value={formData.VIN}
            onChange={(e) => setFormData({ ...formData, VIN: e.target.value })}
          />
        </Form.Item>

        <Form.Item
          wrapperCol={{
            offset: 8,
            span: 16,
          }}
        >
          <Button type="primary" htmlType="submit">
            Save
          </Button>
        </Form.Item>
      </Form>
    );
  };
  const [isModalOpenAddPartsOrderForm, setIsModalOpenAddPartsOrderForm] =
    useState(false);
  const AddPartsOrderFormBtn = () => {
    const showModal = () => {
      setIsModalOpenAddPartsOrderForm(true);
    };
    const handleOk = () => {
      setIsModalOpenAddPartsOrderForm(false);
    };
    const handleCancel = () => {
      setIsModalOpenAddPartsOrderForm(false);
    };
    return (
      <>
        <Button type="primary" onClick={showModal}>
          Add parts order
        </Button>
        <Modal
          title="Add parts order"
          open={isModalOpenAddPartsOrderForm}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          {AddPartsOrderForm()}
        </Modal>
      </>
    );
  };

  // State for each input field
  const [purchaseOrderNumber_AddParts, setPurchaseOrderNumber_AddParts] =
    useState("");
  const [partNumber_AddParts, setPartNumber_AddParts] = useState("");
  const [quantity, setQuantity] = useState("");
  const [status, setStatus] = useState("");
  const [description, setDescription] = useState("");
  const [partCost, setPartCost] = useState("");
  const [vendorName, setVendorName] = useState("");
  const [VIN, setVIN] = useState("");
  const [formData_add_part, setFormData_add_part] = useState({
    purchase_order_number: "", // Initialize with empty values
    part_number: "",
    qunatity: 0,
    status: "",
    description: "",
    part_cost: 0,
    vendor_name: "",
    VIN: "",
  });
  //add parts page
  //   function AddParts() {

  //     // Handle form submission
  //     const handleSubmit = (e) => {
  //         e.preventDefault();
  //         // Logic to save the parts information
  //         // For now, just logging to the console
  //         console.log({
  //             purchaseOrderNumber_AddParts,
  //             partNumber_AddParts,
  //             quantity,
  //             status,
  //             description,
  //             partCost,
  //             vendorName,
  //             VIN
  //         });
  //     };

  //     return (
  //         <div className="add-parts-container">
  //             <h2>Add Parts</h2>
  //             <form onSubmit={handleSubmit}>
  //                 <label>
  //                     Purchase Order Number:
  //                     <input type="text" value={purchaseOrderNumber_AddParts} onChange={(e) => setPurchaseOrderNumber_AddParts(e.target.value)} />
  //                 </label>
  //                 <label>populate
  //                     <input type="text" value={partNumber_AddParts} onChange={(e) => setPartNumber_AddParts(e.target.value)} />
  //                 </label>
  //                 <label>
  //                     Quantity:
  //                     <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
  //                 </label>
  //                 <label>
  //                     Status:
  //                     <input type="text" value={status} onChange={(e) => setStatus(e.target.value)} />
  //                 </label>
  //                 <label>
  //                     Description:
  //                     <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
  //                 </label>
  //                 <label>
  //                     Part Cost:
  //                     <input type="number" value={partCost} onChange={(e) => setPartCost(e.target.value)} />
  //                 </label>
  //                 <label>
  //                     Vendor Name:
  //                     <input type="text" value={vendorName} onChange={(e) => setVendorName(e.target.value)} />
  //                 </label>
  //                 <label>
  //                     VIN:
  //                     <input type="text" value={VIN} onChange={(e) => setVIN(e.target.value)} />
  //                 </label>
  //                 <button type="submit">Save</button>
  //             </form>
  //         </div>
  //     );
  //   }
  const submitForm_add_part = () => {
    fetch(
      `${BASIC_URL}/add_part?purchase_order_number=${formData_add_part.purchase_order_number.trim()}&part_number=${formData_add_part.part_number}&quantity=${formData_add_part.quantity}&status=${formData_add_part.status}&description=${formData_add_part.description}&part_cost=${formData_add_part.part_cost}&vendor_name=${formData_add_part.vendor_name}&VIN=${formData_add_part.VIN}`
    //   {
    //     method: "POST",
    //     body: JSON.stringify({
    //       purchase_order_number: formData_add_part.purchase_order_number.trim(),
    //       part_number: formData_add_part.part_number.trim(),
    //       quantity: parseFloat(formData_add_part.quantity),
    //       status: formData_add_part.status.trim(),
    //       description: formData_add_part.description,
    //       part_cost: parseFloat(formData_add_part.part_cost),
    //       vendor_name: formData_add_part.vendor_name.trim(),
    //       VIN: formData_add_part.VIN.trim(),
    //     }),
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //   }
    )
      .then((response) => {
        // if (response.status === 200) {
        //   return response.json().then((data) => {
        //     console.log("Add part details sucessfully!", data);
        //     alert("New part added successfully");
        //   });
        // } else {
        //   console.error("Request failed with status:", response.status);
        //   alert("An error occurred while adding the part order");
        // }
        if (!response.ok) {
            messageApi.open({
              type: "error",
              content: response.text(),
            });
            throw new Error(`HTTP Error: ${response.status}`);
          }

          messageApi.open({
            type: "success",
            content: "Add part succeed!",
          });
      })
      .catch((error) => {
        console.error("An error occurred:", error);
      });
  };

  const AddParts = () => {
    const onFinish = (values) => {
      //   console.log("Success:", values);
      // Make the API call using the values from formData
      submitForm_add_part(formData_add_part);
    };
    const onFinishFailed = (errorInfo) => {
      console.log("Failed:", errorInfo);
    };
    console.log("test", formData_add_part);
    return (
      <Form
        name="basic"
        labelCol={{
          span: 8,
        }}
        wrapperCol={{
          span: 16,
        }}
        style={{
          maxWidth: 600,
        }}
        initialValues={{
          remember: true,
        }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        onFieldsChange={(e) => {const name = [e[0].name[0]];
            const val = e[0].value;
            const newData = {...formData_add_part};
            newData[name] = val;
            setFormData_add_part(newData);}}
      >
        <Form.Item
          label="Purchase Order Number" //ideally should dropdown
          name="purchase_order_number"
          placeholder="Purchase Order Number"
        >
          <Input
            value={formData_add_part.purchase_order_number}
            onChange={(e) =>
              setFormData_add_part({
                ...formData_add_part,
                purchase_order_number: e.target.value,
              })
            }
          />
        </Form.Item>

        <Form.Item
          label="Part Number"
          name="part_number"
          placeholder="Part Number"
        >
          <Input
            value={formData_add_part.part_number}
            onChange={(e) =>
              setFormData_add_part({
                ...formData_add_part,
                part_number: e.target.value,
              })
            }
          />
        </Form.Item>
        <Form.Item label="Quantity" name="quantity" placeholder="quantity">
          <Input
            value={formData_add_part.quantity}
            onChange={(e) =>
              setFormData_add_part({
                ...formData_add_part,
                quantity: e.target.value,
              })
            }
          />
        </Form.Item>

        <Form.Item label="status" name="status" placeholder="status">
          <Select
            allowClear
            value={formData_add_part.status}
            onChange={(value) =>
              setFormData_add_part({ ...formData_add_part, status: value })
            }
          >
            <Option value="ordered">ordered</Option>
            <Option value="received">received</Option>
            <Option value="installed">installed</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="description"
          name="description"
          placeholder="description"
        >
          <Input
            value={formData_add_part.description}
            onChange={(e) =>
              setFormData_add_part({
                ...formData_add_part,
                description: e.target.value,
              })
            }
          />
        </Form.Item>
        <Form.Item label="part_cost" name="part_cost" placeholder="part_cost">
          <Input
            value={formData_add_part.part_cost}
            onChange={(e) =>
              setFormData_add_part({
                ...formData_add_part,
                part_cost: e.target.value,
              })
            }
          />
        </Form.Item>
        <Form.Item
          label="vendor_name"
          name="vendor_name"
          placeholder="vendor_name"
        >
          <Input
            value={formData_add_part.vendor_name}
            onChange={(e) =>
              setFormData_add_part({
                ...formData_add_part,
                vendor_name: e.target.value,
              })
            }
          />
        </Form.Item>

        <Form.Item label="VIN" name="VIN" placeholder="VIN">
          <Input
            value={formData_add_part.VIN}
            onChange={(e) =>
              setFormData_add_part({
                ...formData_add_part,
                VIN: e.target.value,
              })
            }
          />
        </Form.Item>
        <Form.Item
          wrapperCol={{
            offset: 8,
            span: 16,
          }}
        >
          <Button type="primary" htmlType="submit">
            Save
          </Button>
        </Form.Item>
      </Form>
    );
  };
  const [isModalOpenAddParts, setIsModalOpenAddParts] = useState(false);
  const AddPartsBtn = () => {
    const showModal = () => {
      setIsModalOpenAddParts(true);
    };
    const handleOk = () => {
      setIsModalOpenAddParts(false);
    };
    const handleCancel = () => {
      setIsModalOpenAddParts(false);
    };
    return (
      <>
        <Button type="primary" onClick={showModal}>
          Add parts
        </Button>
        <Modal
          title="Add parts"
          open={isModalOpenAddParts}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          {AddParts()}
        </Modal>
      </>
    );
  };

  //update part status
  const [purchaseOrderNumber, setPurchaseOrderNumber] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [partStatus, setPartStatus] = useState("");

  const [formData_upd_part_stat, setFormData_updPartStatus] = useState({
    status: "", // Initialize with empty values
    purchase_order_number: "",
    part_number: "",
  });

  //example: http://localhost:3301/add_parts_order?vendor_name=Bioholding&purchase_order_number=999&VIN=036EG6XGHFJ822528
  const submitForm_upd_part_stat = (formData_upd_part_stat) => {
    fetch(
      `${BASIC_URL}/update_part_status?status=${formData_upd_part_stat.status}&purchase_order_number=${formData_upd_part_stat.purchase_order_number}&part_number=${formData_upd_part_stat.part_number}`,
      {
        method: "POST",
        body: JSON.stringify({
          status: formData_upd_part_stat.status,
          purchase_order_number:
            formData_upd_part_stat.purchase_order_number.trim(),
          part_number: formData_upd_part_stat.part_number.trim(),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => {
        // if (response.status === 200) {
        //   return response.json().then((data) => {
        //     console.log("Update part status sucessfully!", data);
        //     alert("Update part status successfully");
        //   });
        // } else {
        //   console.error("Request failed with status:", response.status);
        //   alert("An error occurred while updating part statu");
        // }
        if (!response.ok) {
            messageApi.open({
              type: "error",
              content: response.text(),
            });
            throw new Error(`HTTP Error: ${response.status}`);
          }

          messageApi.open({
            type: "success",
            content: "Update part status succeed!",
          });
      })
      .catch((error) => {
        console.error("An error occurred:", error);
        // alert("An error occurred while processing your request");
      });
  };
  //   function UpdatePartStatus() {
  //     const handleSearch = async () => {
  //       // Implement search logic here, for example, an API call
  //       // This is just a placeholder
  //       console.log("Searching for:", purchaseOrderNumber, partNumber);
  //       // Assuming the API response updates the partStatus
  //       // setPartStatus(response.status);
  //     };

  //     const handleSave = async () => {
  //       try {
  //         const response = await fetch(
  //           "http://localhost:3301/update_part_status",
  //           {
  //             method: "PUT",
  //             headers: {
  //               "Content-Type": "application/json",
  //             },
  //             body: JSON.stringify({
  //               purchaseOrderNumber,
  //               partNumber,
  //               newStatus,
  //             }),
  //           }
  //         );

  //         const data = await response.json();
  //         console.log(data.message);
  //       } catch (error) {
  //         console.error("Error:", error);
  //       }
  //     };

  //     return (
  //       <div>
  //         <h2>Update Part Status</h2>
  //         <div>
  //           <label>
  //             Purchase Order Number:
  //             <input
  //               type="text"
  //               value={purchaseOrderNumber}
  //               onChange={(e) => setPurchaseOrderNumber(e.target.value)}
  //             />
  //           </label>
  //           <label>
  //             Part Number:
  //             <input
  //               type="text"
  //               value={partNumber}
  //               onChange={(e) => setPartNumber(e.target.value)}
  //             />
  //           </label>
  //           <button onClick={handleSearch}>Search</button>
  //         </div>

  //         <div>
  //           <h3>Current Status: {partStatus}</h3>
  //           <label>
  //             New Status:
  //             <input
  //               type="text"
  //               value={newStatus}
  //               onChange={(e) => setNewStatus(e.target.value)}
  //             />
  //           </label>
  //           <button onClick={handleSave}>Save</button>
  //         </div>
  //       </div>
  //     );
  //   }

  // update part status

  const UpdatePartStatus = () => {
    const onFinish = (values) => {
      //   console.log("Success:", values);
      // Make the API call using the values from formData
      submitForm_upd_part_stat(formData_upd_part_stat);
    };
    const onFinishFailed = (errorInfo) => {
      console.log("Failed:", errorInfo);
    };

    return (
      <Form
        name="basic"
        labelCol={{
          span: 8,
        }}
        wrapperCol={{
          span: 16,
        }}
        style={{
          maxWidth: 600,
        }}
        initialValues={{
          remember: true,
        }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          label="Part Order Number"
          name="purchase_order_number"
          placeholder="purchase_order_number"
        >
          <Input
            value={formData_upd_part_stat.purchase_order_number}
            onChange={(e) =>
              setFormData_updPartStatus({
                ...formData_upd_part_stat,
                purchase_order_number: e.target.value,
              })
            }
          />
        </Form.Item>
        <Form.Item label="Status" name="status" placeholder="Status">
          <Select
            allowClear
            value={formData_upd_part_stat.status}
            onChange={(value) =>
              setFormData_updPartStatus({
                ...formData_upd_part_stat,
                status: value,
              })
            }
          >
            <Option value="ordered">ordered</Option>
            <Option value="received">received</Option>
            <Option value="installed">installed</Option>
          </Select>
        </Form.Item>

        <Form.Item
          label="Part Number"
          name="part_number"
          placeholder="part_number"
        >
          <Input
            value={formData_upd_part_stat.part_number}
            onChange={(e) =>
              setFormData_updPartStatus({
                ...formData_upd_part_stat,
                part_number: e.target.value,
              })
            }
          />
        </Form.Item>

        <Form.Item
          wrapperCol={{
            offset: 8,
            span: 16,
          }}
        >
          <Button type="primary" htmlType="submit">
            Update Status
          </Button>
        </Form.Item>
      </Form>
    );
  };
  const [isModalOpenUpdatePartStatu, setIsModalOpenUpdatePartStatu] =
    useState(false);
  const UpdatePartStatusBtn = () => {
    const showModal = () => {
      setIsModalOpenUpdatePartStatu(true);
    };
    const handleOk = () => {
      setIsModalOpenUpdatePartStatu(false);
    };
    const handleCancel = () => {
      setIsModalOpenUpdatePartStatu(false);
    };
    return (
      <>
        <Button type="primary" onClick={showModal}>
          Update part status
        </Button>
        <Modal
          title="Update part status"
          open={isModalOpenUpdatePartStatu}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          {UpdatePartStatus()}
        </Modal>
      </>
    );
  };

  const renderVendorPage = () => {
    return (
      <div>
        <div style={{ margin: "20px 20px 50px 20px" }}>
          {render_vendor_search()}
        </div>
        {renderAddVendorForm()}
        <Button type="primary" onClick={() => setViewVendor(false)}>
          Back
        </Button>
      </div>
    );
  };

  // search vendor
  const [vendorData, setVendorData] = useState([]);
  const [vendorInputText, setVendorInputText] = useState("");
  const [vendorSearchClicked, setVendorSearchClicked] = useState(false);
  useEffect(() => {
    // Check if the inputText matches drivers_license
    if (vendorInputText) {
      fetch(`${BASIC_URL}/get_vendor_details/${vendorInputText}`)
        .then((response) => response.json())
        .then((vendorData) => setVendorData(vendorData[1]));
    }
  }, [vendorInputText]); // Only re-run the effect when inputText changes
  const render_vendor_search = () => {
    const handleInputChange = (event) => {
      setVendorInputText(event.target.value);
    };

    // Define a function to handle the search icon click
    const handleSearchIconClick = () => {
      // Set searchClicked to true to trigger rendering of NormalReportTable
      setVendorSearchClicked(true);
    };

    return (
      <Space direction="vertical" size="middle">
        <Space.Compact size="large">
          <Input
            addonBefore={
              <SearchOutlined
                onClick={handleSearchIconClick}
                style={{ cursor: "pointer" }}
              />
            }
            placeholder="#Vendor Name"
            onChange={handleInputChange} // Update inputText on change
          />
        </Space.Compact>

        {/* Conditionally render NormalReportTable when data is available */}
        {vendorSearchClicked && <NormalReportTable data={vendorData} />}
      </Space>
    );
  };

  //add vendor page
  const [formData_AddVendorForm, setFormData_AddVendorForm] = useState({
    vendor_name: "", // Initialize with empty values
    phone_number: "",
    street: "",
    city: "",
    state: "",
    postal_code: "",
  });
  const submitForm_AddVendorForm = (formData) => {
    fetch(
      `${BASIC_URL}/add_vendor_details?vendor_name=${formData_AddVendorForm.vendor_name}&phone_number=${formData_AddVendorForm.phone_number}&street=${formData_AddVendorForm.street}&city=${formData_AddVendorForm.city}&state=${formData_AddVendorForm.state}&postal_code=${formData_AddVendorForm.postal_code}`,
      {
        method: "POST",
        body: JSON.stringify({
          vendor_name: formData_AddVendorForm.vendor_name,
          phone_number: formData_AddVendorForm.phone_number,
          street: formData_AddVendorForm.street,
          city: formData_AddVendorForm.city,
          state: formData_AddVendorForm.state,
          postal_code: formData_AddVendorForm.postal_code,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => {
        if (response.status === 200) {
          return response.json().then((data) => {
            console.log("Add vendor details sucessfully!", data);
            alert("New vendor added successfully");
          });
        } else {
          console.error("Request failed with status:", response.status);
          alert("An error occurred while adding the part order");
        }
      })
      .catch((error) => {
        console.error("An error occurred:", error);

        alert("An error occurred while processing your request");
      });
  };
  const AddVendorForm = () => {
    const onFinish = (values) => {
      //   console.log("Success:", values);
      // Make the API call using the values from formData
      submitForm_AddVendorForm(formData_AddVendorForm);
    };
    const onFinishFailed = (errorInfo) => {
      console.log("Failed:", errorInfo);
    };

    //example: http://localhost:3301/add_vendor_details?vendor_name=test&phone_number=8888&street=test&city=test&state&postal_code=test

    return (
      <Form
        name="basic"
        labelCol={{
          span: 8,
        }}
        wrapperCol={{
          span: 16,
        }}
        style={{
          maxWidth: 600,
        }}
        initialValues={{
          remember: true,
        }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          label="Vendor Name"
          name="vendor_name"
          placeholder="Vendor Name"
        >
          <Input
            value={formData_AddVendorForm.vendor_name}
            onChange={(e) =>
              setFormData_AddVendorForm({
                ...formData,
                vendor_name: e.target.value,
              })
            }
          />
        </Form.Item>

        <Form.Item
          label="Phone Number"
          name="phone_number"
          placeholder="Phone Number"
        >
          <Input
            value={formData_AddVendorForm.phone_number}
            onChange={(e) =>
              setFormData({
                ...formData_AddVendorForm,
                phone_number: e.target.value,
              })
            }
          />
        </Form.Item>

        <Form.Item label="Street" name="street" placeholder="Street">
          <Input
            value={formData_AddVendorForm.street}
            onChange={(e) =>
              setFormData({ ...formData_AddVendorForm, street: e.target.value })
            }
          />
        </Form.Item>
        <Form.Item label="City" name="city" placeholder="City">
          <Input
            value={formData_AddVendorForm.city}
            onChange={(e) =>
              setFormData({ ...formData_AddVendorForm, city: e.target.value })
            }
          />
        </Form.Item>
        <Form.Item label="State" name="state" placeholder="State">
          <Input
            value={formData_AddVendorForm.state}
            onChange={(e) =>
              setFormData({ ...formData_AddVendorForm, state: e.target.value })
            }
          />
        </Form.Item>
        <Form.Item
          label="Postal Code"
          name="postal_code"
          placeholder="Postal Code"
        >
          <Input
            value={formData_AddVendorForm.postal_code}
            onChange={(e) =>
              setFormData({
                ...formData_AddVendorForm,
                postal_code: e.target.value,
              })
            }
          />
        </Form.Item>

        <Form.Item
          wrapperCol={{
            offset: 8,
            span: 16,
          }}
        >
          <Button type="primary" htmlType="submit">
            Save
          </Button>
        </Form.Item>
      </Form>
    );
  };

  const [isModalOpen_AddVendorForm, setIsModalOpen_AddVendorForm] =
    useState(false);
  const renderAddVendorForm = () => {
    const showModal = () => {
      setIsModalOpen_AddVendorForm(true);
    };
    const handleOk = () => {
      setIsModalOpen_AddVendorForm(false);
    };
    const handleCancel = () => {
      setIsModalOpen_AddVendorForm(false);
    };
    return (
      <>
        <Button type="primary" onClick={showModal}>
          Add vendor
        </Button>
        <Modal
          title="Add vendor"
          open={isModalOpen_AddVendorForm}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          {AddVendorForm()}
        </Modal>
      </>
    );
  };

  // UI to add individual customer
  const [inputCustomerDetails, setInputCustomerDetails] = useState({
    email: "",
    phone_number: "",
    street: "",
    city: "",
    state: "",
    postal_code: "",
    drivers_license: "",
    first_name: "",
    last_name: "",
  });
  const put_individual_details = async () => {
    const email = inputCustomerDetails.email;
    const phone_number = inputCustomerDetails.phone_number;
    const street = inputCustomerDetails.street;
    const city = inputCustomerDetails.city;
    const state = inputCustomerDetails.state;
    const postal_code = inputCustomerDetails.postal_code;
    const drivers_license = inputCustomerDetails.drivers_license;
    const first_name = inputCustomerDetails.first_name;
    const last_name = inputCustomerDetails.last_name;

    let url = `${BASIC_URL}/add_individual_customer?email=${email}&phone_number=${phone_number}&street=${street}&city=${city}&state=${state}&postal_code=${postal_code}&drivers_license=${drivers_license}&first_name=${first_name}&last_name=${last_name}`;
    try {
      const response = await fetch(url);

      if (!response.ok) {
        messageApi.open({
          type: "error",
          content: response.text(),
        });
        throw new Error(`HTTP Error: ${response.status}`);
      }

      messageApi.open({
        type: "success",
        content: "Add succeed!",
      });
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };
  const AddIndividualCustomer = () => {
    //console.warn('rxiong upate', inputCustomerDetails);

    const AddIndividualCustomerApp = () => (
      <>
        {/* <Radio.Group onChange={onChange} value={value}>
          <Radio value="individual">Individual</Radio>
          <Radio value="business">Business</Radio>
        </Radio.Group> */}
        <br />
        <br />
        <Input
          size="default size"
          placeholder="email"
          style={{ width: 200 }}
          onChange={(e) =>
            setInputCustomerDetails({
              ...inputCustomerDetails,
              email: e.target.value,
            })
          }
        />
        <br />
        <br />
        <Input
          size="default size"
          placeholder="phone_number"
          style={{ width: 200 }}
          onChange={(e) =>
            setInputCustomerDetails({
              ...inputCustomerDetails,
              phone_number: e.target.value,
            })
          }
        />
        <br />
        <br />
        <Input
          size="default size"
          placeholder="street"
          style={{ width: 200 }}
          onChange={(e) =>
            setInputCustomerDetails({
              ...inputCustomerDetails,
              street: e.target.value,
            })
          }
        />
        <br />
        <br />
        <Input
          size="default size"
          placeholder="city"
          style={{ width: 200 }}
          onChange={(e) =>
            setInputCustomerDetails({
              ...inputCustomerDetails,
              city: e.target.value,
            })
          }
        />
        <br />
        <br />
        <Select
          size="default size"
          placeholder="state"
          style={{ width: 200 }}
          options={[
            { value: "AL", label: "Alabama" },
            { value: "AK", label: "Alaska" },
            { value: "AZ", label: "Arizona" },
            { value: "AR", label: "Arkansas" },
            { value: "CA", label: "California" },
            { value: "CO", label: "Colorado" },
            { value: "CT", label: "Connecticut" },
            { value: "DE", label: "Delaware" },
            { value: "FL", label: "Florida" },
            { value: "GA", label: "Georgia" },
            { value: "HI", label: "Hawaii" },
            { value: "ID", label: "Idaho" },
            { value: "IL", label: "Illinois" },
            { value: "IN", label: "Indiana" },
            { value: "IA", label: "Iowa" },
            { value: "KS", label: "Kansas" },
            { value: "KY", label: "Kentucky" },
            { value: "LA", label: "Louisiana" },
            { value: "ME", label: "Maine" },
            { value: "MD", label: "Maryland" },
            { value: "MA", label: "Massachusetts" },
            { value: "MI", label: "Michigan" },
            { value: "MN", label: "Minnesota" },
            { value: "MS", label: "Mississippi" },
            { value: "MO", label: "Missouri" },
            { value: "MT", label: "Montana" },
            { value: "NE", label: "Nebraska" },
            { value: "NV", label: "Nevada" },
            { value: "NH", label: "New Hampshire" },
            { value: "NJ", label: "New Jersey" },
            { value: "NM", label: "New Mexico" },
            { value: "NY", label: "New York" },
            { value: "NC", label: "North Carolina" },
            { value: "ND", label: "North Dakota" },
            { value: "OH", label: "Ohio" },
            { value: "OK", label: "Oklahoma" },
            { value: "OR", label: "Oregon" },
            { value: "PA", label: "Pennsylvania" },
            { value: "RI", label: "Rhode Island" },
            { value: "SC", label: "South Carolina" },
            { value: "SD", label: "South Dakota" },
            { value: "TN", label: "Tennessee" },
            { value: "TX", label: "Texas" },
            { value: "UT", label: "Utah" },
            { value: "VT", label: "Vermont" },
            { value: "VA", label: "Virginia" },
            { value: "WA", label: "Washington" },
            { value: "WV", label: "West Virginia" },
            { value: "WI", label: "Wisconsin" },
            { value: "WY", label: "Wyoming" },
          ]}
          onChange={(value) =>
            setInputCustomerDetails({
              ...inputCustomerDetails,
              state: value,
            })
          }
        />
        <br />
        <br />
        <Input
          size="default size"
          placeholder="postal_code"
          style={{ width: 200 }}
          onChange={(e) =>
            setInputCustomerDetails({
              ...inputCustomerDetails,
              postal_code: e.target.value,
            })
          }
        />
        <br />
        <br />
        <Input
          size="default size"
          placeholder="drivers_license"
          style={{ width: 200 }}
          onChange={(e) =>
            setInputCustomerDetails({
              ...inputCustomerDetails,
              drivers_license: e.target.value,
            })
          }
        />
        <br />
        <br />
        <Input
          size="default size"
          placeholder="first name"
          style={{ width: 200 }}
          onChange={(e) =>
            setInputCustomerDetails({
              ...inputCustomerDetails,
              first_name: e.target.value,
            })
          }
        />
        <br />
        <br />
        <Input
          size="default size"
          placeholder="last name"
          style={{ width: 200 }}
          onChange={(e) =>
            setInputCustomerDetails({
              ...inputCustomerDetails,
              last_name: e.target.value,
            })
          }
        />
        <br />
        <br />
        <Button type="primary" onClick={() => put_individual_details()}>
          Add
        </Button>
      </>
    );
    return <>{AddIndividualCustomerApp()}</>;
  };
  const [
    isModalOpen_AddIndividualCustomer,
    setIsModalOpen_AddIndividualCustomer,
  ] = useState(false);
  const AddIndividualCustomerBtn = () => {
    const showModal = () => {
      setIsModalOpen_AddIndividualCustomer(true);
    };
    const handleOk = () => {
      setIsModalOpen_AddIndividualCustomer(false);
    };
    const handleCancel = () => {
      setIsModalOpen_AddIndividualCustomer(false);
    };
    return (
      <>
        <Button type="primary" onClick={showModal}>
          Add Individual Customer
        </Button>
        <Modal
          title="Add Individual Customer"
          open={isModalOpen_AddIndividualCustomer}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          {AddIndividualCustomer()}
        </Modal>
      </>
    );
  };

  // UI to add business customer
  const [inputBusinessDetails, setInputBusinessDetails] = useState({
    email: "",
    phone_number: "",
    street: "",
    city: "",
    state: "",
    postal_code: "",
    tax: "",
    company_name: "",
    title: "",
    first_name: "",
    last_name: "",
  });
  const put_business_details = async () => {
    const email = inputBusinessDetails.email;
    const phone_number = inputBusinessDetails.phone_number;
    const street = inputBusinessDetails.street;
    const city = inputBusinessDetails.city;
    const state = inputBusinessDetails.state;
    const postal_code = inputBusinessDetails.postal_code;
    const tax = inputBusinessDetails.tax;
    const company_name = inputBusinessDetails.company_name;
    const title = inputBusinessDetails.title;
    const first_name = inputBusinessDetails.first_name;
    const last_name = inputBusinessDetails.last_name;

    let url = `${BASIC_URL}/add_business_customer?email=${email}&phone_number=${phone_number}&street=${street}&city=${city}&state=${state}&postal_code=${postal_code}&tax=${tax}&company_name=${company_name}&title=${title}&first_name=${first_name}&last_name=${last_name}`;
    try {
      const response = await fetch(url);

      if (!response.ok) {
        messageApi.open({
          type: "error",
          content: response.text(),
        });
        throw new Error(`HTTP Error: ${response.status}`);
      }

      messageApi.open({
        type: "success",
        content: "Add succeed!",
      });
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };
  const AddBusinessCustomer = () => {
    //console.warn('rxiong upate', inputBusinessDetails);

    const AddBusinessCustomerApp = () => (
      <>
        {/* <Radio.Group onChange={onChange} value={value}>
          <Radio value="individual">Individual</Radio>
          <Radio value="business">Business</Radio>
        </Radio.Group> */}
        <br />
        <br />
        <Input
          size="default size"
          placeholder="email"
          style={{ width: 200 }}
          onChange={(e) =>
            setInputBusinessDetails({
              ...inputBusinessDetails,
              email: e.target.value,
            })
          }
        />
        <br />
        <br />
        <Input
          size="default size"
          placeholder="phone_number"
          style={{ width: 200 }}
          onChange={(e) =>
            setInputBusinessDetails({
              ...inputBusinessDetails,
              phone_number: e.target.value,
            })
          }
        />
        <br />
        <br />
        <Input
          size="default size"
          placeholder="street"
          style={{ width: 200 }}
          onChange={(e) =>
            setInputBusinessDetails({
              ...inputBusinessDetails,
              street: e.target.value,
            })
          }
        />
        <br />
        <br />
        <Input
          size="default size"
          placeholder="city"
          style={{ width: 200 }}
          onChange={(e) =>
            setInputBusinessDetails({
              ...inputBusinessDetails,
              city: e.target.value,
            })
          }
        />
        <br />
        <br />
        <Select
          size="default size"
          placeholder="state"
          style={{ width: 200 }}
          options={[
            { value: "AL", label: "Alabama" },
            { value: "AK", label: "Alaska" },
            { value: "AZ", label: "Arizona" },
            { value: "AR", label: "Arkansas" },
            { value: "CA", label: "California" },
            { value: "CO", label: "Colorado" },
            { value: "CT", label: "Connecticut" },
            { value: "DE", label: "Delaware" },
            { value: "FL", label: "Florida" },
            { value: "GA", label: "Georgia" },
            { value: "HI", label: "Hawaii" },
            { value: "ID", label: "Idaho" },
            { value: "IL", label: "Illinois" },
            { value: "IN", label: "Indiana" },
            { value: "IA", label: "Iowa" },
            { value: "KS", label: "Kansas" },
            { value: "KY", label: "Kentucky" },
            { value: "LA", label: "Louisiana" },
            { value: "ME", label: "Maine" },
            { value: "MD", label: "Maryland" },
            { value: "MA", label: "Massachusetts" },
            { value: "MI", label: "Michigan" },
            { value: "MN", label: "Minnesota" },
            { value: "MS", label: "Mississippi" },
            { value: "MO", label: "Missouri" },
            { value: "MT", label: "Montana" },
            { value: "NE", label: "Nebraska" },
            { value: "NV", label: "Nevada" },
            { value: "NH", label: "New Hampshire" },
            { value: "NJ", label: "New Jersey" },
            { value: "NM", label: "New Mexico" },
            { value: "NY", label: "New York" },
            { value: "NC", label: "North Carolina" },
            { value: "ND", label: "North Dakota" },
            { value: "OH", label: "Ohio" },
            { value: "OK", label: "Oklahoma" },
            { value: "OR", label: "Oregon" },
            { value: "PA", label: "Pennsylvania" },
            { value: "RI", label: "Rhode Island" },
            { value: "SC", label: "South Carolina" },
            { value: "SD", label: "South Dakota" },
            { value: "TN", label: "Tennessee" },
            { value: "TX", label: "Texas" },
            { value: "UT", label: "Utah" },
            { value: "VT", label: "Vermont" },
            { value: "VA", label: "Virginia" },
            { value: "WA", label: "Washington" },
            { value: "WV", label: "West Virginia" },
            { value: "WI", label: "Wisconsin" },
            { value: "WY", label: "Wyoming" },
          ]}
          onChange={(value) =>
            setInputBusinessDetails({
              ...inputBusinessDetails,
              state: value,
            })
          }
        />
        <br />
        <br />
        <Input
          size="default size"
          placeholder="postal_code"
          style={{ width: 200 }}
          onChange={(e) =>
            setInputBusinessDetails({
              ...inputBusinessDetails,
              postal_code: e.target.value,
            })
          }
        />
        <br />
        <br />
        <Input
          size="default size"
          placeholder="tax"
          style={{ width: 200 }}
          onChange={(e) =>
            setInputBusinessDetails({
              ...inputBusinessDetails,
              tax: e.target.value,
            })
          }
        />
        <br />
        <br />
        <Input
          size="default size"
          placeholder="company_name"
          style={{ width: 200 }}
          onChange={(e) =>
            setInputBusinessDetails({
              ...inputBusinessDetails,
              company_name: e.target.value,
            })
          }
        />
        <br />
        <br />
        <Input
          size="default size"
          placeholder="title"
          style={{ width: 200 }}
          onChange={(e) =>
            setInputBusinessDetails({
              ...inputBusinessDetails,
              title: e.target.value,
            })
          }
        />
        <br />
        <br />
        <Input
          size="default size"
          placeholder="first name"
          style={{ width: 200 }}
          onChange={(e) =>
            setInputBusinessDetails({
              ...inputBusinessDetails,
              first_name: e.target.value,
            })
          }
        />
        <br />
        <br />
        <Input
          size="default size"
          placeholder="last name"
          style={{ width: 200 }}
          onChange={(e) =>
            setInputBusinessDetails({
              ...inputBusinessDetails,
              last_name: e.target.value,
            })
          }
        />
        <br />
        <br />
        <Button type="primary" onClick={() => put_business_details()}>
          Add
        </Button>
      </>
    );
    return <>{AddBusinessCustomerApp()}</>;
  };
  const [isModalOpen_AddBusinessCustomer, setIsModalOpen_AddBusinessCustomer] =
    useState(false);
  const AddBusinessCustomerBtn = () => {
    const showModal = () => {
      setIsModalOpen_AddBusinessCustomer(true);
    };
    const handleOk = () => {
      setIsModalOpen_AddBusinessCustomer(false);
    };
    const handleCancel = () => {
      setIsModalOpen_AddBusinessCustomer(false);
    };
    return (
      <>
        <Button type="primary" onClick={showModal}>
          Add Business Customer
        </Button>
        <Modal
          title="Add Business Customer"
          open={isModalOpen_AddBusinessCustomer}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          {AddBusinessCustomer()}
        </Modal>
      </>
    );
  };

  // UI to add vehicle
  const [inputVehicleDetails, setInputVehicleDetails] = useState({
    VIN:'',
    fuel_type:'',
    model_name:'',
    model_year:'',
    description:'',
    milege:'',
    manufacturer:'',
    salesperson_username:'',
    condition:'',
    purchase_date:'',
    purchase_price:'',
    inventory_clerk_username:'',
    sale_date:'',
    vehicle_type:'',
    vehicle_color:'',
    customer_username:'',
    seller:'',
  });
  const put_vehicle_details = async () => {
    const VIN = inputVehicleDetails.VIN;
    const fuel_type = inputVehicleDetails.fuel_type;
    const model_name = inputVehicleDetails.model_name;
    const model_year = inputVehicleDetails.model_year;
    const description = inputVehicleDetails.description;
    const milege = inputVehicleDetails.milege;
    const manufacturer = inputVehicleDetails.manufacturer;
    const salesperson_username = inputVehicleDetails.salesperson_username;
    const condition = inputVehicleDetails.condition;
    const purchase_date = inputVehicleDetails.purchase_date;
    const purchase_price = inputVehicleDetails.purchase_price;
    const inventory_clerk_username =
      inputVehicleDetails.inventory_clerk_username;
    const sale_date = inputVehicleDetails.sale_date;
    const vehicle_type = inputVehicleDetails.vehicle_type;
    const vehicle_color = inputVehicleDetails.vehicle_color;
    const customer_username = inputVehicleDetails.customer_username;
    const seller = inputVehicleDetails.seller;

    let url = `${BASIC_URL}/add_vehicle?VIN=${VIN}&fuel_type=${fuel_type}&model_name=${model_name}&model_year=${model_year}&description=${description}&milege=${milege}&manufacturer=${manufacturer}&salesperson_username=${salesperson_username}&condition=${condition}&purchase_date=${purchase_date}&purchase_price=${purchase_price}&inventory_clear_username=${inventory_clerk_username}&sale_date=${sale_date}&vehicle_type=${vehicle_type}&vehicle_color=${vehicle_color}&customer_username=${customer_username}&seller=${seller}`;
    try {
      const response = await fetch(url);

      if (!response.ok) {
        messageApi.open({
          type: "error",
          content: response.text(),
        });
        throw new Error(`HTTP Error: ${response.status}`);
      }

      messageApi.open({
        type: "success",
        content: "Add succeed!",
      });
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };
  const AddVehicle = () => {
    //console.warn('rxiong upate', inputVehicleDetails);
    const AddVehicleApp = () => (
      <>
          <br />
          <Input size="default size" placeholder="VIN" style={{width: 200,}} onChange={(e) =>
              setInputVehicleDetails({
                ...inputVehicleDetails,
                VIN: e.target.value,
              })
            }/>
          <br />
          <br />
          <Select size = "default size" placeholder="fuel_type"
            style={{width: 200,}}
            options={[
              { value: "Gas", label: "Gas" },
              { value: "Diesel", label: "Diesel" },
              { value: "Plugin Hybrid", label: "Plugin Hybrid" },
              { value: "Fuel Cell", label: "Fuel Cell" },
              { value: "Hybrid", label: "Hybrid" },
              { value: "Battery", label: "Battery" },
              { value: "Natural Gas", label: "Natural Gas" },
            ]}
            onChange={(value) =>
              setInputVehicleDetails({
                ...inputVehicleDetails,
                fuel_type: value,
              })
            }
          />
          <br />
          <br />
          <Input size="default size" placeholder="model_year"style={{width: 200,}} onChange={(e) =>
              setInputVehicleDetails({
                ...inputVehicleDetails,
                model_year: e.target.value,
              })
            }/>
          <br />
          <br />
          <Input size="default size" placeholder="model_name"style={{width: 200,}} onChange={(e) =>
              setInputVehicleDetails({
                ...inputVehicleDetails,
                model_name: e.target.value,
              })
            }/>
          <br />
          <br />
          <Input size="default size" placeholder="description"style={{width: 200,}} onChange={(e) =>
              setInputVehicleDetails({
                ...inputVehicleDetails,
                description: e.target.value,
              })
            }/>
          <br />
          <br />
          <Input size="default size" placeholder="milege"style={{width: 200,}} onChange={(e) =>
              setInputVehicleDetails({
                ...inputVehicleDetails,
                milege: e.target.value,
              })
            }/>
          <br />
          <br />
          <Select size = "default size" placeholder="manufacturer"
            style={{width: 200,}}
            options={[
              { value: "Acura", label: "Acura" },
              { value: "FIAT", label: "FIAT" },
              { value: "Lamborghini", label: "Lamborghini" },
              { value: "Nio", label: "Nio" },
              { value: "Alfa Romeo", label: "Ford" },
              { value: "Land Rover", label: "Land Rover" },
              { value: "Porsche", label: "Porsche" },
              { value: "Aston Martin", label: "Aston Martin" },
              { value: "Geeley", label: "Geeley" },
              { value: "Lexus", label: "Lexus" },
              { value: "Ram", label: "Ram" },
              { value: "Audi", label: "Audi" },
              { value: "Genesis", label: "Genesis" },
              { value: "Lincoln", label: "Lincoln" },
              { value: "Rivian", label: "Rivian" },
              { value: "Bentley", label: "Bentley" },
              { value: "GMC", label: "GMC" },
              { value: "Lotus", label: "Lotus" },
              { value: "Rolls-Royce", label: "Rolls-Royce" },
              { value: "BMW", label: "BMW" },
              { value: "Honda", label: "Honda" },
              { value: "Maserati", label: "Maserati" },
              { value: "smart", label: "smart" },
              { value: "Buick", label: "Buick" },
              { value: "Hyundai", label: "Hyundai" },
              { value: "MAZDA", label: "MAZDA" },
              { value: "Subaru", label: "Subaru" },
              { value: "Cadillac", label: "Cadillac" },
              { value: "INFINITI", label: "INFINITI" },
              { value: "Mclaren", label: "Mclaren" },
              { value: "Tesla", label: "Tesla" },
              { value: "Chevrolet", label: "Chevrolet" },
              { value: "Jaguar", label: "Jaguar" },
              { value: "Mercedes-Benz", label: "Mercedes-Benz" },
              { value: "Toyota", label: "Toyota" },
              { value: "Chrysler", label: "Chrysler" },
              { value: "Jeep", label: "Jeep" },
              { value: "MINI", label: "MINI" },
              { value: "Volkswagen", label: "Volkswagen" },
              { value: "Dodge", label: "Dodge" },
              { value: "Karma", label: "Karma" },
              { value: "Mitsubishi", label: "Mitsubishi" },
              { value: "Volvo", label: "Volvo" },
              { value: "Ferrari", label: "Ferrari" },
              { value: "Kia", label: "Kia" },
              { value: "Nissan", label: "Nissan" },
              { value: "XPeng", label: "XPeng" },
            ]}
            onChange={(value) =>
              setInputVehicleDetails({
                ...inputVehicleDetails,
                manufacturer: value,
              })
            }
          />
          <br />
          <br />
          <Input size="default size" placeholder="salesperson_username"style={{width: 200,}} onChange={(e) =>
              setInputVehicleDetails({
                ...inputVehicleDetails,
                salesperson_username: e.target.value,
              })
            }/>
          <br />
          <br />
          <Select
            placeholder="condition"
            style={{width: 200,}}
            options={[
              {
                value: '',
                label: '',
              },
              {
                value: 'Excellent',
                label: 'Excellent',
              },
              {
                value: 'Very Good',
                label: 'Very Good',
              },
              {
                value: 'Good',
                label: 'Good',
              },
              {
                value: 'Fair',
                label: 'Fair',
              }
            ]}
            onChange={(value) =>
              setInputVehicleDetails({
                ...inputVehicleDetails,
                condition: value,
              })
            }/>
          <br />
          <br />
          purchase date <Input size="default size" type = "date" placeholder="purchase_date"style={{width: 200,}} onChange={(e) =>
              setInputVehicleDetails({
                ...inputVehicleDetails,
                purchase_date: e.target.value,
              })
            }/>
          <br />
          <br />
          <Input size="default size" placeholder="purchase_price"style={{width: 200,}} onChange={(e) =>
              setInputVehicleDetails({
                ...inputVehicleDetails,
                purchase_price: e.target.value,
              })
            }/>
          <br />
          <br />
          <Input size="default size" placeholder="inventory_clerk_username"style={{width: 200,}} onChange={(e) =>
              setInputVehicleDetails({
                ...inputVehicleDetails,
                inventory_clerk_username: e.target.value,
              })
            }/>
          <br />
          <br />
          sale date <Input size="default size" type = "date" placeholder="sale_date"style={{width: 200,}} onChange={(e) =>
              setInputVehicleDetails({
                ...inputVehicleDetails,
                sale_date: e.target.value,
              })
            }/>
          <br />
          <br />
          <Select size = "default size" placeholder="vehicle_type"
            style={{width: 200,}}
            options={[
              { value: "Sedan", label: "Sedan" },
              { value: "Coupe", label: "Coupe" },
              { value: "Convertible", label: "Convertible" },
              { value: "Truck", label: "Truck" },
              { value: "Van", label: "Van" },
              { value: "Minivan", label: "Minivan" },
              { value: "SUV", label: "SUV" },
              { value: "Other", label: "Other" },
            ]}
            onChange={(value) =>
              setInputVehicleDetails({
                ...inputVehicleDetails,
                vehicle_type: value,
              })
            }
          />
          <br />
          <br />
          <Select
            mode="multiple"
            style={{
              width: 200,
            }}
            placeholder="vehicle_color"
            onChange={(value) =>
              setInputVehicleDetails({
                ...inputVehicleDetails,
                vehicle_color: value,
              })
            }
            options={[
              { value: "Aluminum", label: "Aluminum" },
              { value: "Beige", label: "Beige" },
              { value: "Black", label: "Black" },
              { value: "Blue", label: "Blue" },
              { value: "Brown", label: "Brown" },
              { value: "Bronze", label: "Bronze" },
              { value: "Claret", label: "Claret" },
              { value: "Copper", label: "Copper" },
              { value: "Cream", label: "Cream" },
              { value: "Gold", label: "Gold" },
              { value: "Gray", label: "Gray" },
              { value: "Green", label: "Green" },
              { value: "Maroon", label: "Maroon" },
              { value: "Metallic", label: "Metallic" },
              { value: "Navy", label: "Navy" },
              { value: "Orange", label: "Orange" },
              { value: "Pink", label: "Pink" },
              { value: "Purple", label: "Purple" },
              { value: "Red", label: "Red" },
              { value: "White", label: "White" },
              { value: "Yellow", label: "Yellow" },

            ]}
          />
          <br />
          <br />
          <Input size="default size" placeholder="customer_username"style={{width: 200,}} onChange={(e) =>
              setInputVehicleDetails({
                ...inputVehicleDetails,
                customer_username: e.target.value,
              })
            }/>
          <br />
          <br />
          <Input size="default size" placeholder="seller"style={{width: 200,}} onChange={(e) =>
              setInputVehicleDetails({
                ...inputVehicleDetails,
                seller: e.target.value,
              })
            }/>
          <br />
          <br />
          <Button type="primary" onClick={()=>put_vehicle_details()}>Add</Button>
        </>
    );
    return <>{AddVehicleApp()}</>;
  };
  const [isModalOpen_AddVehicle, setIsModalOpen_AddVehicle] = useState(false);
  const AddVehicleBtn = () => {
    const showModal = () => {
      setIsModalOpen_AddVehicle(true);
    };
    const handleOk = () => {
      setIsModalOpen_AddVehicle(false);
    };
    const handleCancel = () => {
      setIsModalOpen_AddVehicle(false);
    };
    return (
      <>
        <Button type="primary" onClick={showModal}>
          Add Vehicle
        </Button>
        <Modal
          title="Add Vehicle"
          open={isModalOpen_AddVehicle}
          onOk={handleOk}
          onCancel={handleCancel}
        >
          {AddVehicle()}
        </Modal>
      </>
    );
  };

  const renderExample = () => {
    const App = () => {
      const [isModalOpen, setIsModalOpen] = useState(false);
      const showModal = () => {
        setIsModalOpen(true);
      };
      const handleOk = () => {
        setIsModalOpen(false);
      };
      const handleCancel = () => {
        setIsModalOpen(false);
      };
      return (
        <>
          <Button type="primary" onClick={showModal}>
            Open Modal
          </Button>
          <Modal
            title="Basic Modal"
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
          >
            <p>Some contents...</p>
            <p>Some contents...</p>
            <p>Some contents...</p>
          </Modal>
        </>
      );
    };
    return (
      <>
        Test
        {App()}
        <App />
      </>
    );
  };

  const items = [
    {
      label: login + " Search",
      key: "Search",
    },
  ];

  login == "Inventory Clerk" &&
    items.push({ label: "Add Vechile", key: "Add Vechile" });
  login == "Manager" && items.push({ label: "Reports", key: "Reports" });
  login == "Owner" && items.push({ label: "Add Vechile", key: "Add Vechile" });
  login == "Owner" && items.push({ label: "Reports", key: "Reports" });
  login == "Owner" && items.push({ label: "Sell Car", key: "Sell Car" });
  login == "Salesperson" && items.push({ label: "Sell Car", key: "Sell Car" });

  const [current, setCurrent] = useState("Search");
  const onMenuClick = (e) => {
    console.log("click ", e);
    setCurrent(e.key);
  };

  const renderPage = () => {
    switch (current) {
      case "Search":
        return renderLandingPage();
      case "Reports":
        return renderReportPage();
      case "Add Vechile":
        return renderAddVechilePage();
      case "Sell Car":
        return renderSellCarPage();
    }
  };

  const { Header, Content } = Layout;
  return (
    <Layout>
      {contextHolder}
      <Header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 1,
          width: "100%",
          display: "flex",
          alignItems: "center",
        }}
      >
        {login && (
          <Menu
            onClick={onMenuClick}
            selectedKeys={[current]}
            mode="horizontal"
            items={items}
          />
        )}
        {renderLogin()}
      </Header>
      <Content style={{ padding: "50px 50px", backgroundColor: "white" }}>
        {renderPage()}
      </Content>
    </Layout>
  );
};

export default BuzzCars;
