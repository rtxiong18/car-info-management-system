// Node & Mysql Docs: https://www.w3schools.com/nodejs/nodejs_mysql.asp

const express = require("express");

const port = 3301;
const cors = require("cors");

const app = express();
app.use(cors());

// Enable CORS for all routes or specify allowed origins
// You can replace '*' with the specific origin of your frontend application
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

// db connection
const mysql = require("mysql");
const { Tillana } = require("next/font/google");
const { message } = require("antd");

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  multipleStatements: true,
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});

const use_database = "Use buzzCars;";

var availableVehiclesView =
  use_database +
  "CREATE OR REPLACE VIEW availableVehicles AS SELECT V.VIN FROM Vehicle V LEFT JOIN Parts_order po ON V.VIN = po.VIN WHERE V.sale_date IS NULL AND (po.purchase_order_number IS NULL OR po. purchase_order_number NOT IN (SELECT DISTINCT(po.purchase_order_number) FROM Parts_order po INNER JOIN Part p ON po.purchase_order_number = p.purchase_order_number WHERE p.status <> 'installed'))";
con.query(availableVehiclesView, function (err, result) {
  if (err) {
    console.log(err);
  } else {
    console.log("available vehicles completed!!!");
  }
});

var pendingVehiclesView =
  use_database +
  "CREATE OR REPLACE VIEW vehiclesPending AS SELECT V.VIN FROM Vehicle V LEFT JOIN Parts_order po ON V.VIN = po.VIN WHERE V.sale_date IS NULL AND po.purchase_order_number IN (SELECT DISTINCT(po.purchase_order_number) FROM Parts_order po INNER JOIN Part p ON po.purchase_order_number = p.purchase_order_number WHERE (p.status <> 'installed'))";
con.query(pendingVehiclesView, function (err, result) {
  if (err) {
    console.log(err);
  } else {
    console.log("pending vehicles completed!!!");
  }
});

var vehicleAndColor =
  use_database +
  "CREATE OR REPLACE VIEW vehicleAndColor AS SELECT DISTINCT V. VIN, V.vehicle_type, V.model_year, V.manufacturer, V.model_name, V.fuel_type, V.description, V.milege, GROUP_CONCAT(C.color SEPARATOR ', ') as color FROM Vehicle V INNER JOIN Vehicle_color C ON V.VIN = C.VIN GROUP BY V.VIN";
con.query(vehicleAndColor, function (err, result) {
  if (err) {
    console.log(err);
  } else {
    console.log("VehicleAndColors completed!!!");
  }
});

var totalPartsCost =
  use_database +
  "CREATE OR REPLACE VIEW vehiclePartsCost AS SELECT v.VIN, SUM(p.quantity * p.part_cost) AS total_part_cost FROM Vehicle v LEFT JOIN (select distinct purchase_order_number, VIN from Parts_order) po ON v.VIN = po.VIN LEFT JOIN Part p ON p.purchase_order_number = po.purchase_order_number and p.VIN = po.VIN GROUP BY v.VIN;";
con.query(totalPartsCost, function (err, result) {
  if (err) {
    console.log(err);
  } else {
    console.log("VehiclePartsCost completed!!!");
  }
});

var vehiclePrice =
  use_database +
  "CREATE OR REPLACE VIEW vehiclePrice AS SELECT v.VIN, (1.25*v.purchase_price + 1.1*coalesce(c.total_part_cost,0)) as sale_price, c.total_part_cost FROM Vehicle v INNER JOIN vehiclePartsCost c on v.VIN = c.VIN";
con.query(vehiclePrice, function (err, result) {
  if (err) {
    console.log(err);
  } else {
    console.log("VehiclePrice completed!!!");
  }
});

var sellerinfo =
  use_database +
  "CREATE OR REPLACE VIEW sellerInfo AS select v.vin as vin, b.company_name as company_name, b.title as title, b.first_name as first_name, b.last_name as last_name, b.Username as username from Vehicle v join Business b on v.seller = b.tax  Union select v.vin as vin, Null as company_name, Null as title, i.first_name as first_name, i.last_name as last_name, i.Username as username from Vehicle v join Individual i on v.seller = i.drivers_license";
con.query(sellerinfo, function (err, result) {
  if (err) {
    console.log(err);
  } else {
    console.log("sellerInfo completed!!!");
  }
});

var buyerinfo =
  use_database +
  "CREATE OR REPLACE VIEW buyerInfo AS select v.vin as vin, b.company_name as company_name, b.title as title, b.first_name as first_name, b.last_name as last_name, b.Username as username from Vehicle v join Business b on v.customer_username = b.tax  Union select v.vin as vin, Null as company_name, Null as title, i.first_name as first_name, i.last_name as last_name, i.Username as username from Vehicle v join Individual i on v.customer_username = i.drivers_license";
con.query(buyerinfo, function (err, result) {
  if (err) {
    console.log(err);
  } else {
    console.log("buyerInfo completed!!!");
  }
});
// Initialize DB and Table
// run locally

//Login page

function determineTable(username) {
  return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM Inventory_clerk WHERE Username = ?';
      con.query(sql, [username], (err, result) => {
          if (err) {
              reject(err);
          } else {
              if (result.length === 1 && username !== "owner") {
                  resolve("Inventory Clerk");
              }
              else{
                const sql2 = 'SELECT * FROM Manager WHERE Username = ?';
                con.query(sql2, [username], (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        if (result.length === 1 && username !== "owner") {
                            resolve("Manager");
                        }
                        else{
                          const sql3 = 'SELECT * FROM Salesperson WHERE Username = ?';
                          con.query(sql3, [username], (err, result) => {
                              if (err) {
                                  reject(err);
                              } else {
                                  if (result.length === 1 && username !== "owner") {
                                      resolve("Salesperson");
                                  }
                                  else{
                                    resolve("Owner");
                                  }
                        }

              })}}
          })
  }}});
  });
}

app.get("/login", async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*"); // Enable CORS
  const { username, password } = req.query;

  if (!username || !password) {
    return res.status(400).send("Username and password are required!");
  }

  const userRole = await determineTable(username);
  console.log(userRole)
  const sql = 'Use buzzCars;SELECT * FROM User WHERE Username = ? AND password = ?';
  con.query(sql, [username, password], (err, result) => {
    if (err) throw err;
    if (result[1].length === 1) {
      console.log("Login Successful!!!");
      //console.log(userRole)
      res.status(200).send({ role: userRole });
  } else {
      console.log("Login Failed because username and password do not match!");
      res.status(401).send('Invalid credentials for login');
  }
  });

});



//Edit Customert Profile
app.get("/edit_customer_profile", async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");

  const { customerType, username } = req.query;
  console.log("Received customerType:", customerType); // Debugging
  console.log("Received username:", username); // Debugging

  var sql = "Use buzzCars;";
  if (customerType === "Individual") {
    sql = "SELECT * FROM Individual WHERE Username = ?";
    values = [username];
  } else if (customerType === "Business") {
    sql = "SELECT * FROM Business WHERE Username = ?";
    values = [username];
  } else {
    return res.status(400).send("Invalid customer type");
  }

  con.query(sql, values, function (err, result) {
    if (err) {
      return res.status(500).send("Database error");
    }
    console.log("/edit_customer_profile: succeed!");
    res.send(result);
  });
});

//View Vehicle Details
app.get("/get_vehicle_details/:VIN", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*"); // Enable CORS
  const VIN = req.params.VIN;
  var sql = `Use buzzCars;
   SELECT * FROM Vehicle WHERE VIN = '${VIN}'
   `;
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("/get_vehicle_details: succeed!");
    res.send(result);
  });
});

//Monthly sales report
app.get("/get_rpt_monthly_report_summary", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*"); // Enable CORS
  var sql = `Use buzzCars;
    select SalesYear, SalesMonth, count(1) vehicleSold,
    round(sum(salePrice),2) totalSalesIncome,
    round(sum(salePrice-purchase_price-partCosts),2) netSalesIncome
    from
    (select
        v.VIN,
        YEAR(sale_date) AS SalesYear,
        MONTH(sale_date) AS SalesMonth,
        round(ifnull(sum(part_cost*quantity),0),2) partCosts,
        round(min(purchase_price),2) purchase_price,
        round(ifnull(sum(part_cost*quantity),0)*1.1 + min(purchase_price)*1.25, 2) salePrice
    FROM
        Vehicle v
      LEFT JOIN (select distinct purchase_order_number, VIN from Parts_order) po ON v.VIN = po.VIN
      LEFT JOIN Part p ON p.purchase_order_number = po.purchase_order_number and p.VIN = po.VIN
    where sale_date is not null
    group by 1,2,3) temp
    group by 1,2
    HAVING vehicleSold > 0
    ORDER BY SalesYear DESC , SalesMonth DESC;
    `;
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("/get_rpt_monthly_report_summary: succeed!");
    res.send(result);
  });
});

//Monthly sales report drilldown
app.get("/get_rpt_monthly_report_drilldown", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*"); // Enable CORS

  const SalesYear = req.query.SalesYear; // Example: http://your-api-url/get_rpt_monthly_report_drilldown?SalesYear=2023&SalesMonth=5
  const SalesMonth = req.query.SalesMonth;
  const sql = `
  Use buzzCars;
  select concat(first_name, ' ', last_name) salesperson,
  SalesYear,
  SalesMonth,
  count(1) vehicleSold,
  round(sum(salePrice),2) totalSalesIncome,
  round(sum(salePrice-purchase_price-partCosts),2) netSalesIncome
  from
  (select
    v.VIN,
    u.first_name, u.last_name,
    YEAR(sale_date) AS SalesYear,
    MONTH(sale_date) AS SalesMonth,
    round(ifnull(sum(part_cost*quantity),0),2) partCosts,
    round(min(purchase_price),2) purchase_price,
    round(ifnull(sum(part_cost*quantity),0)*1.1 + min(purchase_price)*1.25, 2) salePrice
  FROM
    Vehicle v
	LEFT JOIN (select distinct purchase_order_number, VIN from Parts_order) po ON v.VIN = po.VIN
	LEFT JOIN Part p ON p.purchase_order_number = po.purchase_order_number and p.VIN = po.VIN
    left join \`User\` u on u.username = v.salesperson_username
  where sale_date is not null
  group by 1,2,3,4,5) temp
  group by 1,2,3
  HAVING vehicleSold > 0 and SalesYear = ${SalesYear} and SalesMonth = ${SalesMonth}
  ORDER BY vehicleSold desc, totalSalesIncome desc;
`;

  con.query(sql, [SalesYear, SalesMonth], function (err, result) {
    if (err) throw err;
    console.log("/get_rpt_monthly_report_drilldown: succeed!");
    res.send(result);
  });
});

// seller history
app.get("/get_rpt_seller_hist", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*"); // Enable CORS
  var sql = `Use buzzCars;
    select seller_name,vehicleSold,avgPurchasePrice,partPerVehicle,avgPartCostPerVehicle,
    case when vehicleSold > 0 and (partPerVehicle >= 5 or  avgPartCostPerVehicle >= 500) then 'Y' else 'N' end highlight_flag
    from
    (select coalesce(b.company_name, concat(i.first_name,' ',i.last_name)) seller_name,
    count(distinct v.VIN) vehicleSold,
    round(avg(purchase_price),2) avgPurchasePrice,
    round(ifnull(sum(quantity),0)/count(distinct v.VIN),2) partPerVehicle,
    round(ifnull(sum(part_cost*quantity),0)/count(distinct v.VIN),2) avgPartCostPerVehicle
    from vehicle v
    left join business b on v.seller = b.tax
    left join individual i on v.seller = i.drivers_license
    LEFT JOIN
        (select distinct purchase_order_number, VIN from Parts_order) po ON v.VIN = po.VIN
    LEFT JOIN
        Part p ON p.purchase_order_number = po.purchase_order_number and p.VIN = po.VIN
    group by 1
    order by vehicleSold desc, avgPurchasePrice) temp;
    `;

  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("/get_rpt_seller_hist: succeed!");
    res.send(result);
  });
});

// Average Time in Inventory
app.get("/get_rpt_avgdays_inventory", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*"); // Enable CORS
  var sql = `Use buzzCars;
    SELECT
    vehicle_type Type,
    ROUND(AVG(DATEDIFF(sale_date, purchase_date)+1),
            0) daysInInvetory
    FROM Vehicle
    GROUP BY 1;
`;
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("/get_rpt_avgdays_inventory: succeed!");
    res.send(result);
  });
});

//Price per Condition
app.get("/get_rpt_price_by_cond", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*"); // Enable CORS
  var sql = `Use buzzCars;
    SELECT
    vehicle_type,
    round(avg(case when \`condition\` = 'Good' then purchase_price else 0 end),2) as condition_good,
    round(avg(case when \`condition\` = 'Fair' then purchase_price else 0 end),2) condition_fair,
    round(avg(case when \`condition\` = 'Excellent' then purchase_price else 0 end),2) condition_exl,
    round(avg(case when \`condition\` = 'Very Good' then purchase_price else 0 end),2) condition_vg
    FROM
      vehicle v
    group by 1;
    `;
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("/get_rpt_price_by_cond: succeed!");
    res.send(result);
  });
});

// Parts Statistics
app.get("/get_rpt_part_stats", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*"); // Enable CORS
  var sql = `Use buzzCars;
    select vendor_name, round(sum(quantity),2) quantity, round(sum(part_cost*quantity),2) part_cost
    from
    Part p
    group by 1;
    `;
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("/get_rpt_part_stats: succeed!");
    res.send(result);
  });
});

// API to get all available cars
app.get("/get_available_cars_count", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*"); // Enable CORS

  var sql = "Use buzzCars;" + "SELECT COUNT(*) FROM availableVehicles";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("/get_table: succeed!");
    res.send(result);
  });
});

// API to get all pending cars
app.get("/get_pending_cars_count", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*"); // Enable CORS

  var sql = "Use buzzCars;" + "SELECT COUNT(*) FROM vehiclesPending";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("/get_table: succeed!");
    res.send(result);
  });
});

// API to populate VIN options
app.get("/get_VIN", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*"); // Enable CORS

  var sql = "Use buzzCars;" + "SELECT DISTINCT VIN FROM Vehicle";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("/get_table: succeed!");
    res.send(result);
  });
});

// API to populate vehicle type options
app.get("/get_vehicle_type", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*"); // Enable CORS

  var sql = "Use buzzCars;" + "SELECT DISTINCT vehicle_type FROM Vehicle";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("/get_table: succeed!");
    res.send(result);
  });
});

// API to populate fuel type options
app.get("/get_model_year", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*"); // Enable CORS

  var sql = "Use buzzCars;" + "SELECT DISTINCT model_year FROM Vehicle";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("/get_table: succeed!");
    res.send(result);
  });
});

// API to populate fuel type options
app.get("/get_fuel_type", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*"); // Enable CORS

  var sql = "Use buzzCars;" + "SELECT DISTINCT fuel_type FROM Vehicle";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("/get_table: succeed!");
    res.send(result);
  });
});

// API to populate manufacturer options
app.get("/get_manufacturer", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*"); // Enable CORS

  var sql = "Use buzzCars;" + "SELECT DISTINCT  manufacturer FROM Vehicle";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("/get_table: succeed!");
    res.send(result);
  });
});

// API to populate manufacturer options
app.get("/get_color", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*"); // Enable CORS

  var sql = "Use buzzCars;" + "SELECT DISTINCT  color FROM Vehicle_color";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("/get_rpt_part_stats: succeed!");
    res.send(result);
  });
});

// API to public_search
app.get("/get_public_search", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*"); // Enable CORS

  var sql =
    "Use buzzCars;" +
    "SELECT V. VIN, V.vehicle_type, V.model_year, V.manufacturer, V.model_name, V.fuel_type, V.milege, VP.sale_price, V.color FROM vehicleAndColor V INNER JOIN availableVehicles A ON V.VIN = A.VIN INNER JOIN vehiclePrice VP on V.VIN = VP.VIN WHERE ";
  // need to replace the input from UI later
  //var input = ['Van', '', '', '', 'Purple'];
  //Example: http://your-api-url/get_public_search?vehicleType=Van&manufacturer=&modelYear=&fuelType=&color=&keyword=BMW
  var input = [
    req.query.vehicleType,
    req.query.manufacturer,
    req.query.modelYear,
    req.query.fuelType,
    req.query.color,
  ];
  var keyword = req.query.keyword;
  var values = [];
  var search = "";
  var flag1 = false;
  var flag2 = false;
  const option = [
    "V.vehicle_type = ? AND ",
    "V. manufacturer = ? AND ",
    "V.model_year = ? AND ",
    "V.fuel_type = ? AND ",
    "V.color LIKE ?",
  ];
  var values1 = [];
  var where = "";
  for (let i = 0; i < input.length; i++) {
    if (input[i] != "") {
      flag1 = true;
      where += option[i];
      if (i != input.length - 1) {
        values1.push(input[i]);
      } else {
        values1.push("%" + input[i] + "%");
      }
    } else if (i == input.length - 1) {
      where = where.substring(0, where.length - 5);
    }
  }
  var search1 = sql + where;
  if (keyword != "") {
    flag2 = true;
    var search2 =
      "SELECT V. VIN, V.vehicle_type, V.model_year, V.manufacturer, V.model_name, V.fuel_type, V.milege, VP.sale_price, V.color FROM vehicleAndColor V INNER JOIN availableVehicles A ON V.VIN = A.VIN INNER JOIN vehiclePrice VP on V.VIN = VP.VIN WHERE V. manufacturer LIKE ? OR V.model_year LIKE ? OR V.model_name LIKE ? OR V.description LIKE ?";
    var values2 = [
      "%" + keyword + "%",
      "%" + keyword + "%",
      "%" + keyword + "%",
      "%" + keyword + "%",
    ];
    //values = values1.concat(values2);
    //search = search1 + " UNION " + search2;
  }

  if (!flag1 && flag2){
    values = values2;
    search = search2 + " ORDER BY 1";
    con.query(search, values, function (err, result) {
      if (err) throw err;
      console.log('/get_search: succeed!');
      var temp = [{"fieldCount":0,"affectedRows":0,"insertId":0,"serverStatus":10,"warningCount":0,"message":"","protocol41":true,"changedRows":0}];
      res.send(temp.concat([result]));
    });

  }
  else{
    if (flag1 && flag2){
      values = values1.concat(values2);
      search = search1 + " INTERSECT " + search2 + " ORDER BY 1";
    }
    if (flag1 && !flag2){
      values = values1;
      search = search1 + " ORDER BY 1";
    }

    if (!flag1 && !flag2){
      search = "Use buzzCars;" + "SELECT V. VIN, V.vehicle_type, V.model_year, V.manufacturer, V.model_name, V.fuel_type, V.milege, VP.sale_price, V.color FROM vehicleAndColor V INNER JOIN availableVehicles A ON V.VIN = A.VIN INNER JOIN vehiclePrice VP on V.VIN = VP.VIN";
    }

    con.query(search, values, function (err, result) {
      if (err) throw err;
      console.log('/get_search: succeed!');
      res.send(result)
    });

  }


});

//Edit Vehicle Profile
// works
//test json
/*
{
            "VIN": "PYWDSWXK5X5262660",
            "fuel_type": "Hybrid",
            "model_name": "GALLARDO",
            "model_year": 2014,
            "description": "hydraulic brakes; ",
            "milege": 27663,
            "manufacturer": "Lamborghini",
            "salesperson_username": "user20",
            "condition": "Very Good",
            "purchase_date": "2022-11-12",
            "purchase_price": 3551.46,
            "inventory_clerk_username": "user22",
            "sale_date": "2022-12-03",
            "vehicle_type": "SUV",
            "customer_username": "D5950814801",
            "seller": "C7548135047"
        }
*/
app.get("/edit_vehicle_profile/:VIN", async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  const VIN = req.params.VIN;
  const fuel_type = req.body.fuel_type;
  const model_name = req.body.model_name;
  const model_year = req.body.model_year;
  const description = req.body.description;
  const milege = req.body.milege;
  const manufacturer = req.body.manufacturer;
  const condition = req.body.condition;
  const vehicle_type = req.vehicle_type;
  const purchase_date = req.body.purchase_date;
  const purchase_price = req.body.purchase_price;
  const sale_date = req.body.sale_date;

  const sql = `
    USE buzzCars;
    UPDATE Vehicle SET
    fuel_type = ?,
    vehicle_type = ?,
    model_name = ?,
    model_year = ?,
    description = ?,
    milege = ?,
    manufacturer = ?,
    \`condition\` = ?,
    purchase_date = ?,
    purchase_price = ?,
    sale_date = ?
    WHERE VIN = ?;
    `;
  const values = [
    fuel_type,
    vehicle_type,
    model_name,
    model_year,
    description,
    milege,
    manufacturer,
    condition,
    purchase_date,
    purchase_price,
    sale_date,
    VIN,
  ];

  con.query(sql, values, function (err, result) {
    if (err) {
      const sqlErrorMessage = err.sqlMessage; // Extract the sqlMessage from the error

      const lastIndex = sqlErrorMessage.lastIndexOf("'");

      if (lastIndex !== -1) {
        const truncatedErrorMessage = sqlErrorMessage.substring(0, lastIndex + 1);
        console.error(truncatedErrorMessage);

        res.status(500).send(`${truncatedErrorMessage}`);
        return;
      } else {
        res.status(500).send(`${sqlErrorMessage}`);
        return;
      }
    }
    console.log("/edit_vehicle_profile: succeed!");
    res.send(result);
  });
});

//Parts Order
app.get("/get_parts_order/:purchase_order_number", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*"); // Enable CORS
  const purchase_order_number = req.params.purchase_order_number;

  const containLetters = /[a-zA-Z]/.test(purchase_order_number);
  if (containLetters){
    const vin = purchase_order_number;
    var sql = `Use buzzCars;
  select purchase_order_number, part_number, quantity, \`status\`, \`description\`, part_cost, vendor_name from part
  where VIN = ?;
`;

  con.query(sql, [vin], function (err, result) {
    if (err) throw err;
    console.log("/get_parts_order: succeed!");
    res.send(result);
  });
  }
  else{
    var sql = `Use buzzCars;
    select purchase_order_number, part_number, quantity, \`status\`, \`description\`, part_cost, vendor_name, VIN from part
    where purchase_order_number = ${purchase_order_number};
  `;

    con.query(sql, function (err, result) {
      if (err) throw err;
      console.log("/get_parts_order: succeed!");
      res.send(result);
    });
  }

});

//Add Parts Order
app.post("/add_parts_order", async (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  const { vendor_name, purchase_order_number, VIN } = req.query;

  if (!vendor_name || !purchase_order_number || !VIN) {
    return res.status(400).send("Missing required fields");
  }

  // works: need to insert new part order with exisiting vendor and VIN
  // test sql: INSERT INTO Parts_Order(vendor_name, purchase_order_number, VIN) VALUES ('Bioholding', 100, '036EG6XGHFJ822528')
  var sql =
    "Use buzzCars;" +
    "INSERT INTO Parts_Order(vendor_name, purchase_order_number, VIN) VALUES (?, ?, ?)";

  const values = [vendor_name, purchase_order_number, VIN];

  con.query(sql, values, function (err, result) {
    if (err) {
      // console.error(err);
      const sqlErrorMessage = err.sqlMessage; // Extract the sqlMessage from the error

      const lastIndex = sqlErrorMessage.lastIndexOf("'");

      if (lastIndex !== -1) {
        const truncatedErrorMessage = sqlErrorMessage.substring(0, lastIndex + 1);
        console.error(truncatedErrorMessage);

        res.status(500).send(`${truncatedErrorMessage}`);
        return;
      } else {
        res.status(500).send(`${sqlErrorMessage}`);
        return;
      }
    }
    console.log("/add_parts_order: succeed!");
    res.send(result);
  });
});

//update parts order
app.post("/update_parts_order/:order_number", async (req, res) => {
  res.set("Access_Control_Allow_Origin", "*");
  const vendor_name = req.query.vendor_name.trim();
  const VIN = req.query.VIN.trim();
  const purchase_order_number = req.query.purchase_order_number.trim();

  // works: need to update parts order with existing vendor_name and VIN, if they do not exist in db, it wil fail
  // test sql: UPDATE Parts_order SET vendor_name = 'Doncon', VIN = 'PYWDSWXK5X5262660' where purchase_order_number = 100;
  var sql = `Use buzzCars;
    UPDATE Parts_order SET vendor_name = '${vendor_name}', VIN = '${VIN}'
    where purchase_order_number = ${purchase_order_number};
    `;
  const values = [vendor_name];
  con.query(sql, values, function (err, result) {
    if (err) {
      // console.error(err);
      const sqlErrorMessage = err.sqlMessage; // Extract the sqlMessage from the error

      const lastIndex = sqlErrorMessage.lastIndexOf("'");

      if (lastIndex !== -1) {
        const truncatedErrorMessage = sqlErrorMessage.substring(0, lastIndex + 1);
        console.error(truncatedErrorMessage);

        res.status(500).send(`${truncatedErrorMessage}`);
        return;
      } else {
        res.status(500).send(`${sqlErrorMessage}`);
        return;
      }
    }
    console.log("/update_parts_order: succeed!");
    res.send(result);
  });
});

//Add Parts
//works: when adding new records into part, the part_order_nunber has to be in the parts table already
// all part_number, vendor_name, VIN have to be exist
//test sql:
/*INSERT INTO Part(purchase_order_number,
    part_number, quantity, `status`, `description`, part_cost, vendor_name, VIN)
    VALUES(
      100,
      "DH-EAES0109",
      999,
      "received",
      "ABS brack sensor",
      999.99,
      "Donquadtech",
      "E5W8EPPWZS0896119"
    );
  */

app.get("/add_part", async (req, res) => {
  res.set("Access_Control_Allow_Origin", "*");
  // const {
  //   purchase_order_number,
  //   part_number,
  //   quantity,
  //   status,
  //   description,
  //   part_cost,
  //   vendor_name,
  //   VIN,
  // } = req.body;
  const purchase_order_number = req.query.purchase_order_number.trim();
  const part_number = req.query.part_number.trim();
  const quantity = req.query.quantity;
  const status = req.query.status.trim();
  const description = req.query.description.trim();
  const part_cost = req.query.part_cost;
  const vendor_name = req.query.vendor_name.trim();
  const VIN = req.query.VIN.trim();

  const sql = `
  Use buzzCars;
  INSERT INTO Part(purchase_order_number,
    part_number, quantity, \`status\`, \`description\`, part_cost, vendor_name, VIN)
  VALUES(
    ?, ?, ?, ?, ?, ?, ?, ?
  );
  `;

  const values = [
    purchase_order_number,
    part_number,
    quantity,
    status,
    description,
    part_cost,
    vendor_name,
    VIN,
  ];
  con.query(sql, values, function (err, result) {
    if (err) {
      const sqlErrorMessage = err.sqlMessage; // Extract the sqlMessage from the error

      const lastIndex = sqlErrorMessage.lastIndexOf("'");

      if (lastIndex !== -1) {
        const truncatedErrorMessage = sqlErrorMessage.substring(0, lastIndex + 1);
        console.error(truncatedErrorMessage);

        res.status(500).send(`${truncatedErrorMessage}`);
        return;
      } else {
        res.status(500).send(`${sqlErrorMessage}`);
        return;
      }
    }
    console.log("/add_part: succeed!");
    res.send(result);
  });
});

//API to show the details of a selected car
app.get('/get_selected', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*'); // Enable CORS
  var input = [req.query.vin];
  //Example: http://your-api-url/get_selected?vin=vin
  var sql = "Use buzzCars;" + "SELECT V.VIN, V.vehicle_type, V.model_year, V.model_name, V.manufacturer, V.fuel_type, VC.color, V.milege, VP.sale_price, V.description FROM vehicleAndColor VC INNER JOIN Vehicle V ON VC.VIN = V.VIN INNER JOIN vehiclePrice VP on V.VIN = VP.VIN WHERE V.VIN = ?";
  //const values = ['13DN4WJV2HW654524'];
  con.query(sql, input, function (err, result) {
    if (err) throw err;
    console.log('/get_search: succeed!');
    res.send(result)
  });
});

//API to show the details of a selected car for inventory clerk
app.get("/get_inventory_selected", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*"); // Enable CORS
  var input = [req.query.vin];
  //Example: http://your-api-url/get_inventory_selected?vin=vin

  var sql =
    "Use buzzCars;" +
    "SELECT V.VIN, V.vehicle_type, V.model_year, V.model_name, V.manufacturer, V.fuel_type, VC.color, V.milege, V. purchase_price, VP.sale_price, V.description, V.purchase_date, V.sale_date, VP. total_part_cost,0 FROM vehicleAndColor VC INNER JOIN Vehicle V ON VC.VIN = V.VIN INNER JOIN vehiclePrice VP on V.VIN = VP.VIN WHERE V.VIN = ?";
  //const values = ['13DN4WJV2HW654524'];
  con.query(sql, input, function (err, result) {
    if (err) throw err;
    console.log("/get_search: succeed!");
    res.send(result);
  });
});

//API to show the details of a selected car for manager
app.get("/get_manager_selected", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*"); // Enable CORS
  var input = [req.query.vin];
  //Example: http://your-api-url/get_manager_selected?vin=vin

  var sql =
    "Use buzzCars;" +
    "SELECT V.VIN, V.vehicle_type, V.model_year, V.model_name, V.manufacturer, V.fuel_type, VC.color, V.milege, V. purchase_price, VP.sale_price, V.description, V.purchase_date, V.sale_date, VP. total_part_cost, u.first_name as inventory_clerk_first_name, u.last_name as inventory_clerk_last_name, si.company_name as seller_company, si.title as seller_title, si.first_name as seller_first_name, si.last_name as seller_last_name, bi.company_name as buyer_company, bi.title as buyer_title, bi.first_name as buyer_first_name, bi.last_name as buyer_last_name FROM vehicleAndColor VC INNER JOIN Vehicle V ON VC.VIN = V.VIN INNER JOIN vehiclePrice VP on V.VIN = VP.VIN LEFT JOIN sellerInfo si on V.VIN = si.VIN LEFT JOIN buyerInfo bi on V.VIN = bi.VIN LEFT JOIN User u on V.inventory_clerk_username = u.Username WHERE V.VIN = ?";
  //const values = ['13DN4WJV2HW654524'];
  con.query(sql, input, function (err, result) {
    if (err) throw err;
    console.log("/get_search: succeed!");
    res.send(result);
  });
});

// API to previlege_search
app.get('/get_previleged_search', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*'); // Enable CORS

  var sql =
    "Use buzzCars;" +
    "SELECT V. VIN, V.vehicle_type, V.model_year, V.manufacturer, V.model_name, V.fuel_type, V.milege, VP.sale_price, V.color FROM vehicleAndColor V INNER JOIN availableVehicles A ON V.VIN = A.VIN INNER JOIN vehiclePrice VP on V.VIN = VP.VIN WHERE ";
  //const values = ['13DN4WJV2HW654524','Van', 'Toyota', '2013', 'Gas', '%Purple%'];

  // need to replace the input from UI later
  //V.VIN = ? AND V.vehicle_type = ? AND V. manufacturer = ? AND V.model_year = ? AND V.fuel_type = ? AND V.color LIKE ? ORDER BY V.VIN
  //var input = ['','Van', '', '', '', ''];
  //Example: http://your-api-url/get_previleged_search?vin=&vehicleType=Van&manufacturer=&modelYear=&fuelType=&color=&keyword=
  var input = [
    req.query.vin,
    req.query.vehicleType,
    req.query.manufacturer,
    req.query.modelYear,
    req.query.fuelType,
    req.query.color,
  ];
  var keyword = req.query.keyword;
  var values = [];
  var search = "";
  var flag1 = false;
  var flag2 = false;
  const option = [
    "V.VIN = ? AND ",
    "V.vehicle_type = ? AND ",
    "V. manufacturer = ? AND ",
    "V.model_year = ? AND ",
    "V.fuel_type = ? AND ",
    "V.color LIKE ?",
  ];
  var values1 = [];
  var where = "";
  for (let i = 0; i < input.length; i++) {
    if (input[i] != "") {
      flag1 = true;
      where += option[i];
      if (i != input.length - 1) {
        values1.push(input[i]);
      } else {
        values1.push("%" + input[i] + "%");
      }
    } else if (i == input.length - 1) {
      where = where.substring(0, where.length - 5);
    }
  }
  var search1 = sql + where;
  if (keyword != "") {
    flag2 = true;
    var search2 =
      "SELECT V. VIN, V.vehicle_type, V.model_year, V.manufacturer, V.model_name, V.fuel_type, V.milege, VP.sale_price, V.color FROM vehicleAndColor V INNER JOIN availableVehicles A ON V.VIN = A.VIN INNER JOIN vehiclePrice VP on V.VIN = VP.VIN WHERE V. manufacturer LIKE ? OR V.model_year LIKE ? OR V.model_name LIKE ? OR V.description LIKE ?";
    var values2 = [
      "%" + keyword + "%",
      "%" + keyword + "%",
      "%" + keyword + "%",
      "%" + keyword + "%",
    ];
    //values = values1.concat(values2);
    //search = search1 + " UNION " + search2;
  }
  if (flag1 && flag2) {
    values = values1.concat(values2);
    search = search1 + " INTERSECT " + search2 + " ORDER BY 1";
  }
  if (flag1 && !flag2) {
    values = values1;
    search = search1 + " ORDER BY 1";
  }
  if (!flag1 && flag2) {
    values = values2;
    search = search2 + " ORDER BY 1";
  }

  if (!flag1 && !flag2){
    search = "Use buzzCars;" + "SELECT V. VIN, V.vehicle_type, V.model_year, V.manufacturer, V.model_name, V.fuel_type, V.milege, VP.sale_price, V.color FROM vehicleAndColor V INNER JOIN availableVehicles A ON V.VIN = A.VIN INNER JOIN vehiclePrice VP on V.VIN = VP.VIN";
  }

  con.query(search, values, function (err, result) {
    if (err) throw err;
    console.log("/get_search: succeed!");
    res.send(result);
  });
});

//update part status
// works:  the purchase_order_number and part_number have to be exist
// test sql:
/*
UPDATE Part SET `status` = 'new' WHERE purchase_order_number = 100 AND part_number ='DH-EAES0109';
*/
app.post("/update_part_status", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*"); // Set CORS policy
  const status = req.query.status;
  const purchase_order_number = req.query.purchase_order_number;
  const part_number  = req.query.part_number;

  var findSQL = `Use buzzCars;
  SELECT status FROM Part WHERE purchase_order_number = ? AND part_number = ?;
  `;

  let values = [purchase_order_number, part_number];

  con.query(findSQL, values, function (err, result) {
    if (result[0].length === 0) {
      res.status(500).send(`Failed to find the purchase order number and part number.`);
      return;
    }
  });

  values = [status, purchase_order_number, part_number];
  var sql = `Use buzzCars;
  SET SQL_SAFE_UPDATES = 0;
  UPDATE Part SET \`status\` = ? WHERE purchase_order_number = ? AND part_number = ? AND status != "installed";
  `;

  con.query(sql, values, function (err, result) {
    if (err) {
      const sqlErrorMessage = err.sqlMessage; // Extract the sqlMessage from the error

      const lastIndex = sqlErrorMessage.lastIndexOf("'");

      if (lastIndex !== -1) {
        const truncatedErrorMessage = sqlErrorMessage.substring(0, lastIndex + 1);
        console.error(truncatedErrorMessage);

        res.status(500).send(`${truncatedErrorMessage}`);
        return;
      } else {
        res.status(500).send(`${sqlErrorMessage}`);
        return;
      }
    }
    if (result[result.length - 1].affectedRows === 0) {
      res.status(500).send(`Failed to update, please check your inputs again and installed part status can't be udpated.`);
      return;
    }
    console.log("/update_part_status: succeed!");
    res.send(result);
  });
});

// API to inventory_clerk_search or search within all unsold vehicles
app.get("/get_inventory_search", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*"); // Enable CORS

  var sql =
    "Use buzzCars;" +
    "SELECT V. VIN, V.vehicle_type, V.model_year, V.manufacturer, V.model_name, V.fuel_type, V.milege, VP.sale_price, VC.color FROM vehicleAndColor VC INNER JOIN Vehicle V on VC.VIN = V.VIN INNER JOIN vehiclePrice VP on V.VIN = VP.VIN WHERE V.sale_date IS NULL AND ";
  //const values = ['03KAPEOTGE8482192','Van', 'Geeley', '2016', 'Diesel', '%Brown%'];

  // need to replace the input from UI later
  //V.VIN = ? AND V.vehicle_type = ? AND V. manufacturer = ? AND V.model_year = ? AND V.fuel_type = ? AND VC.color LIKE ? ORDER BY V.VIN
  //var input = ['13DN4WJV2HW654524','Van', 'Toyota', '2013', 'Gas', '%Purple%'];
  //var input = ['','Van', '', '', '', ''];
  //Example: http://your-api-url/get_inventory_search?vin=&vehicleType=Van&manufacturer=&modelYear=&fuelType=&color=&keyword=BMW
  var input = [
    req.query.vin,
    req.query.vehicleType,
    req.query.manufacturer,
    req.query.modelYear,
    req.query.fuelType,
    req.query.color,
  ];
  var keyword = req.query.keyword;
  var values = [];
  var search = "";
  var flag1 = false;
  var flag2 = false;
  const option = [
    "V.VIN = ? AND ",
    "V.vehicle_type = ? AND ",
    "V. manufacturer = ? AND ",
    "V.model_year = ? AND ",
    "V.fuel_type = ? AND ",
    "VC.color LIKE ?",
  ];
  var values1 = [];
  var where = "";
  for (let i = 0; i < input.length; i++) {
    if (input[i] != "") {
      flag1 = true;
      where += option[i];
      if (i != input.length - 1) {
        values1.push(input[i]);
      } else {
        values1.push("%" + input[i] + "%");
      }
    } else if (i == input.length - 1) {
      where = where.substring(0, where.length - 5);
    }
  }
  var search1 = sql + where;
  if (keyword != "") {
    flag2 = true;
    var search2 =
      "SELECT V. VIN, V.vehicle_type, V.model_year, V.manufacturer, V.model_name, V.fuel_type, V.milege, VP.sale_price, VC.color FROM vehicleAndColor VC INNER JOIN Vehicle V on VC.VIN = V.VIN INNER JOIN vehiclePrice VP on V.VIN = VP.VIN WHERE V.sale_date IS NULL AND (V. manufacturer LIKE ? OR V.model_year LIKE ? OR V.model_name LIKE ? OR V.description LIKE ?)";
    var values2 = [
      "%" + keyword + "%",
      "%" + keyword + "%",
      "%" + keyword + "%",
      "%" + keyword + "%",
    ];
    //values = values1.concat(values2);
    //search = search1 + " UNION " + search2;
  }
  if (flag1 && flag2) {
    values = values1.concat(values2);
    search = search1 + " INTERSECT " + search2 + " ORDER BY 1";
  }
  if (flag1 && !flag2) {
    values = values1;
    search = search1 + " ORDER BY 1";
  }
  if (!flag1 && flag2) {
    values = values2;
    search = search2 + " ORDER BY 1";
  }

  if (!flag1 && !flag2){
    search = "Use buzzCars;" + "SELECT V. VIN, V.vehicle_type, V.model_year, V.manufacturer, V.model_name, V.fuel_type, V.milege, VP.sale_price, VC.color FROM vehicleAndColor VC INNER JOIN Vehicle V on VC.VIN = V.VIN INNER JOIN vehiclePrice VP on V.VIN = VP.VIN WHERE V.sale_date IS NULL";
  }

  con.query(search, values, function (err, result) {
    if (err) throw err;
    console.log("/get_search: succeed!");
    res.send(result);
  });
});

//search vendor Details
// vendor_name example: Bioholding
app.get("/get_vendor_details/:vendor_name", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*"); // Enable CORS
  const vendor_name = req.params.vendor_name;
  var sql = `Use buzzCars;
   SELECT * FROM vendor WHERE vendor_name = '${vendor_name}'
   `;
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("/get_vendor_details: succeed!");
    res.send(result);
  });
});

// API to search within sold vehicles
app.get("/get_sold_search", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*"); // Enable CORS

  var sql =
    "Use buzzCars;" +
    "SELECT V. VIN, V.vehicle_type, V.model_year, V.manufacturer, V.model_name, V.fuel_type, V.milege, VP.sale_price, VC.color FROM vehicleAndColor VC INNER JOIN Vehicle V on VC.VIN = V.VIN INNER JOIN vehiclePrice VP on V.VIN = VP.VIN WHERE V.sale_date IS NOT NULL AND ";
  //const values = ['036EG6XGHFJ822528','Minivan', 'Aston Martin', '2014', 'Gas', '%Brown%'];
  // need to replace the input from UI later
  //var input = ['','Van', '', '', '', ''];
  //Example: http://localhost:3301/get_sold_search?vin=&vehicleType=Van&manufacturer=&modelYear=&fuelType=&color=&keyword=BMW
  var input = [
    req.query.vin,
    req.query.vehicleType,
    req.query.manufacturer,
    req.query.modelYear,
    req.query.fuelType,
    req.query.color,
  ];
  var keyword = req.query.keyword;
  var values = [];
  var search = "";
  var flag1 = false;
  var flag2 = false;
  const option = [
    "V.VIN = ? AND ",
    "V.vehicle_type = ? AND ",
    "V. manufacturer = ? AND ",
    "V.model_year = ? AND ",
    "V.fuel_type = ? AND ",
    "VC.color LIKE ?",
  ];
  var values1 = [];
  var where = "";
  for (let i = 0; i < input.length; i++) {
    if (input[i] != "") {
      flag1 = true;
      where += option[i];
      if (i != input.length - 1) {
        values1.push(input[i]);
      } else {
        values1.push("%" + input[i] + "%");
      }
    } else if (i == input.length - 1) {
      where = where.substring(0, where.length - 5);
    }
  }
  var search1 = sql + where;
  if (keyword != "") {
    flag2 = true;
    var search2 =
      "SELECT V. VIN, V.vehicle_type, V.model_year, V.manufacturer, V.model_name, V.fuel_type, V.milege, VP.sale_price, VC.color FROM vehicleAndColor VC INNER JOIN Vehicle V on VC.VIN = V.VIN INNER JOIN vehiclePrice VP on V.VIN = VP.VIN WHERE V.sale_date IS NOT NULL AND (V. manufacturer LIKE ? OR V.model_year LIKE ? OR V.model_name LIKE ? OR V.description LIKE ?)";
    var values2 = [
      "%" + keyword + "%",
      "%" + keyword + "%",
      "%" + keyword + "%",
      "%" + keyword + "%",
    ];
    //values = values1.concat(values2);
    //search = search1 + " UNION " + search2;
  }
  if (flag1 && flag2) {
    values = values1.concat(values2);
    search = search1 + " INTERSECT " + search2 + " ORDER BY 1";
  }
  if (flag1 && !flag2) {
    values = values1;
    search = search1 + " ORDER BY 1";
  }
  if (!flag1 && flag2) {
    values = values2;
    search = search2 + " ORDER BY 1";
  }

  if (!flag1 && !flag2){
    search = "Use buzzCars;" + "SELECT V. VIN, V.vehicle_type, V.model_year, V.manufacturer, V.model_name, V.fuel_type, V.milege, VP.sale_price, VC.color FROM vehicleAndColor VC INNER JOIN Vehicle V on VC.VIN = V.VIN INNER JOIN vehiclePrice VP on V.VIN = VP.VIN WHERE V.sale_date IS NOT NULL";
  }

  con.query(search, values, function (err, result) {
    if (err) throw err;
    console.log("/get_search: succeed!");
    res.send(result);
  });
});

// API to search within all vehicles
app.get("/get_all_search", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*"); // Enable CORS

  var sql =
    "Use buzzCars;" +
    "SELECT V. VIN, V.vehicle_type, V.model_year, V.manufacturer, V.model_name, V.fuel_type, V.milege, VP.sale_price, VC.color FROM vehicleAndColor VC INNER JOIN Vehicle V on VC.VIN = V.VIN INNER JOIN vehiclePrice VP on V.VIN = VP.VIN WHERE ";
  //const values = ['036EG6XGHFJ822528','Minivan', 'Aston Martin', '2014', 'Gas', '%Brown%'];

  // need to replace the input from UI later
  //V.VIN = ? AND V.vehicle_type = ? AND V. manufacturer = ? AND V.model_year = ? AND V.fuel_type = ? AND VC.color LIKE ? ORDER BY V.VIN
  //var input = ['13DN4WJV2HW654524','Van', 'Toyota', '2013', 'Gas', '%Purple%'];
  //var input = ['','Van', '', '', '', ''];
  //Example: http://your-api-url/get_all_search?vin=&vehicleType=Van&manufacturer=&modelYear=&fuelType=&color=&keyword=
  var input = [
    req.query.vin,
    req.query.vehicleType,
    req.query.manufacturer,
    req.query.modelYear,
    req.query.fuelType,
    req.query.color,
  ];
  var keyword = req.query.keyword;
  var values = [];
  var search = "";
  var flag1 = false;
  var flag2 = false;
  const option = [
    "V.VIN = ? AND ",
    "V.vehicle_type = ? AND ",
    "V. manufacturer = ? AND ",
    "V.model_year = ? AND ",
    "V.fuel_type = ? AND ",
    "VC.color LIKE ?",
  ];
  var values1 = [];
  var where = "";
  for (let i = 0; i < input.length; i++) {
    if (input[i] != "") {
      flag1 = true;
      where += option[i];
      if (i != input.length - 1) {
        values1.push(input[i]);
      } else {
        values1.push("%" + input[i] + "%");
      }
    } else if (i == input.length - 1) {
      where = where.substring(0, where.length - 5);
    }
  }
  var search1 = sql + where;
  if (keyword != "") {
    flag2 = true;
    var search2 =
      "SELECT V. VIN, V.vehicle_type, V.model_year, V.manufacturer, V.model_name, V.fuel_type, V.milege, VP.sale_price, VC.color FROM vehicleAndColor VC INNER JOIN Vehicle V on VC.VIN = V.VIN INNER JOIN vehiclePrice VP on V.VIN = VP.VIN WHERE V. manufacturer LIKE ? OR V.model_year LIKE ? OR V.model_name LIKE ? OR V.description LIKE ?";
    var values2 = [
      "%" + keyword + "%",
      "%" + keyword + "%",
      "%" + keyword + "%",
      "%" + keyword + "%",
    ];
    //values = values1.concat(values2);
    //search = search1 + " UNION " + search2;
  }
  if (flag1 && flag2) {
    values = values1.concat(values2);
    search = search1 + " INTERSECT " + search2 + " ORDER BY 1";
  }
  if (flag1 && !flag2) {
    values = values1;
    search = search1 + " ORDER BY 1";
  }
  if (!flag1 && flag2) {
    values = values2;
    search = search2 + " ORDER BY 1";
  }

  if (!flag1 && !flag2){
    search = "Use buzzCars;" + "SELECT V. VIN, V.vehicle_type, V.model_year, V.manufacturer, V.model_name, V.fuel_type, V.milege, VP.sale_price, VC.color FROM vehicleAndColor VC INNER JOIN Vehicle V on VC.VIN = V.VIN INNER JOIN vehiclePrice VP on V.VIN = VP.VIN";
  }

  con.query(search, values, function (err, result) {
    if (err) throw err;
    console.log("/get_search: succeed!");
    res.send(result);
  });
});

// add vendor details
//works
//test json:
/*
 {
            "vendor_name": "newVendor",
            "phone_number": "4708285765",
            "street": "1080 13-street",
            "city": "Laredo",
            "state": "VA",
            "postal_code": "20618"
        }
*/
app.post("/add_vendor_details", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*"); // Set CORS policy
  const { vendor_name, phone_number, street, city, state, postal_code } =
    req.query;

  var sql = `Use buzzCars;
  INSERT INTO Vendor (vendor_name, phone_number, street, city, state, postal_code)
  VALUES (?, ?, ?, ?, ?, ?);
  `;
  const values = [vendor_name, phone_number, street, city, state, postal_code];

  con.query(sql, values, function (err, result) {
    if (err) {
      // console.error(err);
      const sqlErrorMessage = err.sqlMessage; // Extract the sqlMessage from the error

      const lastIndex = sqlErrorMessage.lastIndexOf("'");

      if (lastIndex !== -1) {
        const truncatedErrorMessage = sqlErrorMessage.substring(0, lastIndex + 1);
        console.error(truncatedErrorMessage);

        res.status(500).send(`${truncatedErrorMessage}`);
        return;
      } else {
        res.status(500).send(`${sqlErrorMessage}`);
        return;
      }
    }
    console.log("/add_vendor_details: succeed!");
    res.send(result);
  });
});

app.get("/search_customer_person/:drivers_license", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*"); // Enable CORS
  const drivers_license = req.params.drivers_license;

  var sql = `Use buzzCars;
  select i.first_name, i.last_name, c.email, i.drivers_license, c.phone_number, c.street, c.city, c.state, c.postal_code
from customer c
left join Individual i on c.Username = i.Username
left join Business b on b.Username = c.Username
where case when drivers_license is null then 'Business' else  'Person' end  = 'Person'
and drivers_license = '${drivers_license}';
`;

  con.query(sql, [drivers_license], function (err, result) {
    if (err) throw err;
    console.log("/search_customer: succeed!");
    res.send(result);
  });
});

app.get("/search_customer_business/:tax", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*"); // Enable CORS
  const tax = req.params.tax;

  var sql = `Use buzzCars;
  select b.tax, b.company_name, title, b.first_name, b.last_name, c.email, c.phone_number, c.street, c.city, c.state,c.postal_code
from customer c
left join Individual i on c.Username = i.Username
left join Business b on b.Username = c.Username
where case when drivers_license is null then 'Business' else  'Person' end  = 'Business'
and tax = '${tax}'
`;

  con.query(sql, [tax], function (err, result) {
    if (err) throw err;
    console.log("/search_customer: succeed!");
    res.send(result);
  });
});




// add individual customer works!
// test json
/*{
            "email": "test",
            "phone_number": "test",
            "street": "test",
            "city": "",
            "state": "test",
            "postal_code": "",
            "drivers_license": "test",
            "first_name": "firstname",
            "last_name": "lastname"

        }
        */
app.get("/add_individual_customer", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*"); // Set CORS policy
  const {
    email,
    phone_number,
    street,
    city,
    state,
    postal_code,
    drivers_license,
    first_name,
    last_name,
  } = req.query;

  function generateRandomString(length) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let randomString = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      randomString += charset.charAt(randomIndex);
    }

    return randomString;
  }

  var uniqueKey = generateRandomString(8);
  var sql = `Use buzzCars;
insert into Customer(Username, email, phone_number, street, city, state, postal_code)
VALUES ('${uniqueKey}', ?,?,?,?,?,?);

INSERT INTO Individual (drivers_license, first_name, last_name, Username)
VALUES ('${drivers_license}', '${first_name}', '${last_name}', '${uniqueKey}');
  `;

  const values = [email, phone_number, street, city, state, postal_code];

  con.query(sql, values, function (err, result) {
    if (err) {
      // console.error(err);
      const sqlErrorMessage = err.sqlMessage; // Extract the sqlMessage from the error

      const lastIndex = sqlErrorMessage.lastIndexOf("'");

      if (lastIndex !== -1) {
        const truncatedErrorMessage = sqlErrorMessage.substring(0, lastIndex + 1);
        console.error(truncatedErrorMessage);

        res.status(500).send(`${truncatedErrorMessage}`);
        return;
      } else {
        res.status(500).send(`${sqlErrorMessage}`);
        return;
      }
    }
    console.log("/add_individual_customer: succeed!");
    res.send(result);
  });
});



//add business customer api
//works!
// test json
/*{
            "email": "test",
            "phone_number": "test",
            "street": "test",
            "city": "",
            "state": "test",
            "postal_code": "",
            "tax": "test",
            "company_name": "test",
            "title": "test",
            "first_name":"test",
            "last_name":"test"

        }*/
app.get("/add_business_customer", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*"); // Set CORS policy
  const {
    email,
    phone_number,
    street,
    city,
    state,
    postal_code,
    tax,
    company_name,
    title,
    first_name,
    last_name,
  } = req.query;

  function generateRandomString(length) {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let randomString = "";

    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      randomString += charset.charAt(randomIndex);
    }

    return randomString;
  }

  var uniqueKey = generateRandomString(8);
  var sql = `Use buzzCars;
insert into Customer(Username, email, phone_number, street, city, state, postal_code)
VALUES ('${uniqueKey}', ?,?,?,?,?,?);

Insert into Business (tax, company_name, title, first_name, last_name, Username)
VALUES('${tax}','${company_name}','${title}','${first_name}','${last_name}','${uniqueKey}');
  `;

  const values = [email, phone_number, street, city, state, postal_code];

  con.query(sql, values, function (err, result) {
    if (err) {
      // console.error(err);
      const sqlErrorMessage = err.sqlMessage; // Extract the sqlMessage from the error

      const lastIndex = sqlErrorMessage.lastIndexOf("'");

      if (lastIndex !== -1) {
        const truncatedErrorMessage = sqlErrorMessage.substring(0, lastIndex + 1);
        console.error(truncatedErrorMessage);

        res.status(500).send(`${truncatedErrorMessage}`);
        return;
      } else {
        res.status(500).send(`${sqlErrorMessage}`);
        return;
      }
    }
    console.log("/add_business_customer: succeed!");
    res.send(result);
  });
});

// add vehicle
//works
//test query:
/*
INSERT INTO Vehicle (VIN,
    fuel_type,
    model_name,
    model_year,
    description,
    milege,
    manufacturer,
    salesperson_username,
    `condition`,
    purchase_date,
    purchase_price,
    inventory_clerk_username,
    sale_date,
    vehicle_type,
    customer_username,
    seller)
  VALUES ('test', 'Gas', 'DB9', 2014, 'automatic torque converter; ',108519.0, 'Aston Martin', 'user08', 'Good', '2023-02-07',2964.53, 'user06', '2023-06-28', 'Minivan', 'D6650795352','B9782424828');
*/

// API to add vehicles
app.get("/add_vehicle", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*"); // Set CORS policy
  const {
    VIN,
    fuel_type,
    model_name,
    model_year,
    description,
    milege,
    manufacturer,
    salesperson_username,
    condition,
    purchase_date,
    purchase_price,
    inventory_clerk_username,
    sale_date,
    vehicle_type,
    vehicle_color,
    customer_username,
    seller,
  } = req.query;

  console.log("Received Purchase Date:", purchase_date);
  console.log("Received Sale Date:", sale_date);

  // Check if the dates are provided
  if (purchase_date && sale_date) {
    const purchaseDateObj = new Date(purchase_date);
    const saleDateObj = new Date(sale_date);

    console.log("Parsed Purchase Date:", purchaseDateObj);
    console.log("Parsed Sale Date:", saleDateObj);

    // Check if the parsed dates are valid
    if (isNaN(purchaseDateObj.getTime()) || isNaN(saleDateObj.getTime())) {
      return res.status(400).send("Invalid date format.");
    }

    // Check if purchase date is before sale date
    if (purchaseDateObj >= saleDateObj) {
      return res.status(400).send("Purchase date must be before sale date.");
    }
  }

  if (!model_year || model_year < 1950 || model_year > 2024) {
    return res.status(400).send("Invalid model_year, please make sure it's between 1950 to 2024.");
  }

  var sql1 = `Use buzzCars;
  INSERT INTO Vehicle (VIN,
    fuel_type,
    model_name,
    model_year,
    description,
    milege,
    manufacturer,
    salesperson_username,
    \`condition\`,
    purchase_date,
    purchase_price,
    inventory_clerk_username,
    sale_date,
    vehicle_type,
    customer_username,
    seller)
  VALUES (?, ?, ?, ?, ?, ?,?,?, ?,?,?,?,?,?,?,?);
  `;

  var sql2 = '';
  var values2 = [];

  const addOneColor = `
  INSERT INTO Vehicle_color (VIN,
    color)
  VALUES (?, ?);
  `;

  var colors = vehicle_color.split(',');
  for (let index in colors){
    var temp_value = [VIN, colors[index]];
    values2 = values2.concat(temp_value);
    sql2 += addOneColor;
  }

  var values1 = [
    VIN,
    fuel_type,
    model_name,
    model_year,
    description,
    milege,
    manufacturer,
    salesperson_username,
    condition,
    purchase_date,
    purchase_price,
    inventory_clerk_username,
    sale_date,
    vehicle_type,
    customer_username,
    seller,
  ];

  var values = values1.concat(values2);
  var sql = sql1+sql2;

  con.query(sql, values, function (err, result) {
    if (err) {
      // console.error(err);
      const sqlErrorMessage = err.sqlMessage; // Extract the sqlMessage from the error

      const lastIndex = sqlErrorMessage.lastIndexOf("'");

      if (lastIndex !== -1) {
        const truncatedErrorMessage = sqlErrorMessage.substring(0, lastIndex + 1);
        console.error(truncatedErrorMessage);

        res.status(500).send(`${truncatedErrorMessage}`);
        return;
      } else {
        res.status(500).send(`${sqlErrorMessage}`);
        return;
      }
    }
    console.log("/add_vehicle_details: succeed!");
    res.send(result);
  });
});
