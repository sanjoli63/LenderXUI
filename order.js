//elli for EPC connect
elli.script.connect()

var originData,transactionObject,originationContext,adddocuments, viewdocumnetid;
var api, parameters
fetch('config.json')
  .then(response => response.json())
  .then(config => {
    (api= config.apiEndpoint);
  })
  .catch(error => console.error('Error fetching config:', error));
// This function initializes the origination context for the transaction
initializeOriginationContext()
  async function initializeOriginationContext() {
    try {
        // Retrieving the transaction object
      transactionObject = await elli.script.getObject('transaction')
        // Retrieving the origination context
      originationContext = await transactionObject.getOrigin();
      console.log("origin",originationContext);
       // Checking if origination context ID is available
      if (!originationContext.id) {
        console.log("refresh")
        // Refreshing the origination context if ID is not available
        originationContext = await transactionObject.refreshOrigin();
      }
    // Retrieving origin data using origin ID and partner access token
      const originId = originationContext.id;
      const partnerAccessToken = originationContext.partnerAccessToken;
      originData = await originRequest(originId, partnerAccessToken);
    } catch (error) {
      console.log('Error in initializeOriginationContext:', error);
    }
  }

  // Function to make an origin request using origin ID and partner access token
async function originRequest(originId, partnerAccessToken) {
  var settings = {
    "url": `https://44.201.168.248/api/getOrigin?originId=${originId}&partnerAccessToken=${partnerAccessToken}`,
    "method": "GET"
    
  };
  // Making an AJAX call to retrieve origin data
  $.ajax(settings).done(function (response) {
    console.log(response);
    return response
  });
}
// Function to open a modal with existing values
async function openCreateUI(actionTitle, action){
  console.log("modeal show")
  document.getElementById('action-title').innerHTML = actionTitle;
  document.getElementById('action').innerHTML = action;
  $(".comment-acc").hide();
  console.log("originnnnn: ", originData);
  clickfunction(originData);
  var city = originData.loan.property.city;
  var state = originData.loan.property.state;
  var streetAddress = originData.loan.property.streetAddress;
  var postalCode = originData.loan.property.postalCode;
  var address = ` ${streetAddress}, ${city}, ${state}, ${postalCode}`;
  var loanCreater= originData.originatingParty.pointOfContact.name;
  document.getElementById('Property Address').innerHTML = address;
  var names = originData.loan.applications[0].borrower.fullNameWithSuffix;
   // Retrieving other order details from orderData...
  if (originData.loan.applications[0].coborrower.fullNameWithSuffix) {
    var cobor = originData.loan.applications[0].coborrower.fullNameWithSuffix;
    var names = `${names}, ${cobor}`;
  }
  const toggle = userData['Enable Payment'];
  var loanNumber= originData.loan.loanNumber;
  var purchasePriceAmount=originData.loan.purchasePriceAmount;
  var LoanAmount=originData.loan.borrowerRequestedLoanAmount;
  var loanType=originData.loan.mortgageType;
  var loanprogram=originData.loan.loanProgramName;
  var propertytype= originData.loan.loanProductData.gsePropertyType;
  var loanpurpose=originData.loan.property.loanPurposeType;
  var estimatedValue=originData.loan.estimatedvalue;
  var subtitle1= `${loanNumber ? loanNumber: "Loan Number"} | ${names? names :"Borrower Name, Co-Borrower Name"} |${streetAddress? streetAddress:"Street Adress"} | ${city?city:"City"} ${state?state:"state"} ${postalCode?postalCode:"Postal Code"} ;`
  var subtitle2= `${loanType?loanType:"Loan Type"} | ${loanpurpose?loanpurpose:'Loan Purpose'} | ${propertytype?propertytype :'Property Type'} | Investors: 0 | ${loanprogram?loanprogram:'Loan Program' }` 
   // Updating UI with retrieved order details
  $("#newModal").on('shown.bs.modal', function () {
    if(!toggle)
    {
      $('#paymentMenuButton').removeAttr('data-toggle');
      $('#paymentMenuButton').off('click');
    }
    // Updating UI elements with retrieved order details...
  document.getElementById('Borrower').innerHTML = names ? names: "";
  document.getElementById('Purchase Price').innerHTML = purchasePriceAmount? `$${purchasePriceAmount}`: "";
  document.getElementById('Estimated Value').innerHTML = estimatedValue ? `$${estimatedValue}` :"";
  document.getElementById('Loan Amount').innerHTML = LoanAmount? `$${LoanAmount}`:" ";
  document.getElementById('Loan Number').innerHTML = loanNumber?loanNumber:"";
  document.getElementById('loanTypeMenu').innerHTML =  loanType ? `<span class="selected-tile">${loanType}<span class="remove-tile" data-value=""><i class="bi bi-x"></i></span></span>` : 'Loan Type';
  document.getElementById('LoanProgramsMenu').innerHTML = loanprogram? `<span class="selected-tile">${loanprogram}<span class="remove-tile" data-value=""><i class="bi bi-x"></i></span></span>` :"LoanProgram";
  document.getElementById('loanPurposeMenu').innerHTML = loanpurpose? `<span class="selected-tile">${loanpurpose}<span class="remove-tile" data-value=""><i class="bi bi-x"></i></span></span>` :"Loan Purpose";
  document.getElementById('LoanCreaterName').innerHTML = loanCreater? loanCreater:"Loan Creater";
  document.getElementById('propertypeMenu').innerHTML=propertytype?`<span class="selected-tile">${propertytype}<span class="remove-tile" data-value=""><i class="bi bi-x"></i></span></span>` : "Property Type";
  document.getElementById('subtitle1').innerHTML=subtitle1;
  document.getElementById('subtitle2').innerHTML=subtitle2;
  });
    // Showing the modal
  $("#newModal").modal('show');
};
function mapLoanType(loanType) {
  switch (loanType.toUpperCase()) {
      case "CONVENTIONAL":
          return "conventional";
      case "FHA":
          return "fha";
      case "VA":
          return "va";
      case "HELOC":
          return "equity_loan";
      case "FARMERSHOMEADMINISTRATION":
          return "usda";
      default:
          return loanType;
  }
}
// Loan Purpose Mapping
function mapLoanPurpose(loanPurpose) {
  switch (loanPurpose.toUpperCase()) {
      case "PURCHASE":
          return "Purchase";
      case "CASH-OUT REFINANCE":
      case "NOCASH-OUT REFINANCE":
          return "Refinance";
      case "CONSTRUCTIONONLY":
      case "CONSTRUCTIONTOPERMANENT":
          return "Construction";
      default:
          return "Other";
  }
}
// Property Type Mapping
function mapPropertyType(propertyType) {
  switch (propertyType.toUpperCase()) {
      case "DETACHED":
          return 1;
      case "HIGH RISE CONDOMINIUM":
          return 3;
      case "CONDOMINIUM":
      case "DETACHED CONDO":
          return 2;
      case "MANUFACTURED HOUSING":
          return 9;
      case "COOPERATIVE":
          return 12;
      default:
          return 11; 
  }
}
// Function to handle click events for contact entry
async function clickfunction(response){
  $(".contactentry-item").click(async function(){
    var contactType = $(this).data("contact-type");
    $("#contactentryMenuButton .tt").text(contactType);
    var contactData = await getContactData(contactType,response);
    $("#contactName").val(contactData.contactName || "");
    $("#homePhone").val(contactData.homePhone || "");
    $("#businessPhone").val(contactData.businessPhone || "");
    $("#cellPhone").val(contactData.cellPhone || "");
    $("#email").val(contactData.email || "");
     // Enabling or disabling input fields based on contact type
    if (contactType === "Contact for Entry") {
      console.log(contactType)
      $('#contactName, #homePhone, #businessPhone, #cellPhone, #email').attr("disabled", false);
    } else {
      console.log(contactType)
      $('#contactName, #homePhone, #businessPhone, #cellPhone, #email').attr("disabled", true);
    }
  });

// Function to retrieve contact data based on contact type
  async function getContactData(contactType,response) {
    switch (contactType) {
      case "Borrower":
        // Retrieving borrower contact data from response
        return { contactName: response.loan.applications[0].borrower.fullNameWithSuffix?response.loan.applications[0].borrower.fullNameWithSuffix:"", homePhone: response.loan.applications[0].borrower.homePhoneNumber?response.loan.applications[0].borrower.homePhoneNumber:"", businessPhone: "", cellPhone: "", email: response.loan.applications[0].borrower.emailAddressText?response.loan.applications[0].borrower.emailAddressText:"" };
      case "Co-Borrower":
        // Retrieving co-borrower contact data from response
        return { contactName: response.loan.applications[0].coborrower.fullNameWithSuffix?response.loan.applications[0].coborrower.fullNameWithSuffix:"", homePhone: response.loan.applications[0].coborrower.homePhoneNumber?response.loan.applications[0].coborrower.homePhoneNumber:"", businessPhone: "", cellPhone: "", email: response.loan.applications[0].coborrower.emailAddressText?response.loan.applications[0].coborrower.emailAddressText:"" };
      case "Buyer's Agent":
        const BuyerContact = response.loan.contacts.find(contact => contact.contactType === "Buyers Agent")
        if (BuyerContact) {
          // Access Buyer details
          const BuyerEmail = BuyerContact?.email || "";
          const BuyerName = BuyerContact?.contactName || "";
          const cell= BuyerContact?.cell || "";
          const phone= BuyerContact?.phone || "";
          return { contactName: BuyerName, homePhone: phone, businessPhone: "", cellPhone: cell, email: email}
        } else {
          return { contactName: "", homePhone: "", businessPhone: "", cellPhone: "", email: ""}
        }
      case "Seller's Agent":
        const sellerContact = response.loan.contacts.find(contact => contact.contactType === "Sellers Agent")
        if (sellerContact) {
          // Access seller details
          const sellerEmail = sellerContact?.email || "";
          const sellerName = sellerContact?.contactName || "";
          const cell= sellerContact?.cell || "";
          const phone= sellerContact?.phone || "";
          return { contactName: sellerName, homePhone: phone, businessPhone: "", cellPhone: cell, email: email}
        } else {
          return { contactName: "", homePhone: "", businessPhone: "", cellPhone: "", email: ""}
        }
      default:
        return { contactName: "", homePhone: "", businessPhone: "", cellPhone: "", email: "" };
    }
  }
};


function openEmailModal() {
  $('#emailModal').modal('show');
}
function openCommModal() {
  $('#commentModal').modal('show');
  
}
// Function to add a comment to the comment table
function addComment(){
  var recipientRole = ""
  var taskSubType = ""
  var cannedComments = $('#commentTextarea').val();
    // Checking if the comment is not empty
  if(cannedComments.trim() !== ''){
     // Creating a table row to display the comment
      var tableRow = $('<tr>');
      tableRow.append($('<td>').text(recipientRole));
      tableRow.append($('<td>').text(taskSubType));
      tableRow.append($('<td>').text(cannedComments));
      $('#CommentTableBody').append(tableRow);
      
       // Clearing the comment input field after submission
      // $('#recipientRoleInput').val('');
      // $('#taskSubTypeInput').val('');
      $('#messageTextarea').val('');
  }
  $('#commentTextarea').val('');
}

// Function to open a document viewer modal with the specified ID in view section
async function openDocViewer(id) {
  // Constructing the resource object
  let resource = {
    target: {
      entityId: id,
      entityType: "urn:elli:skydrive"
    }
  };

  // Getting the application object and opening the modal
  const applicationObject = await elli.script.getObject('application');
  viewdocumnetid = await applicationObject.openModal(resource);
  console.log(success);
}

// Function to open a modal to add documents
async function openModel() {
  const action = "getAvailableResources";
  try {
    // Getting the application object and performing the action
    const applicationObject = await elli.script.getObject('application');
    adddocuments = await applicationObject.performAction(action);
    console.log(adddocuments);
    await  addToTable()
  } catch (error) {
    console.log({ error });
  }
}

let userData = null;
let jsondata=null;
// let user = originData.originatingParty.pointOfContact.email;
let user="Birendra@vidyatech.com"
let userObject=null;

// Load JSON data
fetch('setting.json')
    .then(response => response.json())
    .then(data => {
      jsondata=data
        // Check if user exists in JSON data
        userObject = data.user.find(obj => obj[user]);
        if (userObject) {
            userData = userObject[user];
        } else {
            // User not found, use default values
            userData = data.default;
            console.log("User not found, using default values.");
        }
        // Update toggle buttons based on user's settings
        Object.keys(userData).forEach(key => {
          if (key !== "API Key" && key !== "API Secret" && key !== "Base URL") {
              const toggle = document.querySelector(`[data-key="${key}"] .toggleCheckbox`);
              toggle.checked = userData[key];
              handleToggle(toggle);
          }
      });
    })
    .catch(error => console.error('Error loading JSON file:', error));

function saveJsonData() {
  if (!userData) return; // No user data loaded
    const toggleCheckboxes = document.querySelectorAll('.toggleCheckbox');
    toggleCheckboxes.forEach(toggleCheckbox => {
        const key = toggleCheckbox.closest('.tg').getAttribute('data-key');
        userData[key] = toggleCheckbox.checked;
    });
     // Find the user object in the "user" array and update it
     let userIndex = jsondata.user.findIndex(obj => obj[user]);
     if (userIndex !== -1) {
         jsondata.user[userIndex][user] = userData;
     } else {
      // User not found, create a new user object
      const newUserObject = { [user]: userData };
      jsondata.user.push(newUserObject);
      userIndex = jsondata.user.findIndex(obj => obj[user]);
  }
     // Fetch API to save JSON data
     fetch('/update-setting', {
         method: 'PUT',
         headers: {
             'Content-Type': 'application/json',
         },
         body: JSON.stringify({ "user":user,
         "data": jsondata.user[userIndex][user] }), // Send the entire JSON data to the server
     })
     .then(response => response.json())
     .then(data => {
         console.log('Updated JSON data:', data);
     })
     .catch(error => {
         console.error('Error saving JSON data:', error);
     });
 }
 
 // Add event listener to the save button
 document.querySelector('.btn2').addEventListener('click', saveJsonData);

// Event listener for toggle checkboxes
var toggleCheckboxes = document.querySelectorAll('.toggleCheckbox');
toggleCheckboxes.forEach(function(toggleCheckbox) {
  toggleCheckbox.addEventListener('change', function() {
    handleToggle(toggleCheckbox);
  });
  handleToggle(toggleCheckbox);
});

// Function to handle toggle checkbox
function handleToggle(checkbox) {
  var parent = checkbox.parentNode;
  var onLabel = parent.querySelector('.onlabel');
  var offLabel = parent.querySelector('.offlabel');

  if (checkbox.checked) {
    onLabel.style.display = 'inline-block';
    offLabel.style.display = 'none';
  } else {
    onLabel.style.display = 'none';
    offLabel.style.display = 'inline-block';
  }
}

// Functionality for accordion icon change on opening and closing
$(document).ready(function() {
  $('.accordion-header').click(function() {
    $(this).find('.bi-caret-right-fill, .bi-caret-down-fill').toggleClass('bi-caret-right-fill bi-caret-down-fill');
    $(this).find('.bi-chevron-down, .bi-chevron-up').toggleClass('bi-chevron-down bi-chevron-up');
    $('.accordion-header').not($(this)).find('.bi-caret-down-fill').addClass('bi-caret-right-fill');
    $('.accordion-header').not($(this)).find('.bi-chevron-up').addClass('bi-chevron-down');
    $('.accordion-header').not($(this)).find('.bi-caret-down-fill').removeClass('bi-caret-down-fill');
    $('.accordion-header').not($(this)).find('.bi-chevron-up').removeClass('bi-chevron-up');
    $('.accordion-header').removeClass('open');
  });
});

$(function() {
  // Datepicker configuration
  $("#datepicker").datepicker({
    dateFormat: 'yy-mm-dd',
    onSelect: function(date, inst) {
      $(".date-icon").css("border", "none");
    },
    beforeShowDay: function(date) {
      var today = new Date();
      var isDisabled = date.getTime() < today.getTime();
      return [!isDisabled, isDisabled ? 'disabled' : ''];
    }
  });

  // Click event for date icon to show datepicker
  $("#date-icon").click(function() {
    $(".date-icon").css("border", "2px solid #63a2d5");
    $("#datepicker").datepicker("show");
  });

  // Click event for datepicker to show border
  $("#datepicker").click(function() {
    $(".date-icon").css("border", "2px solid #63a2d5");
  });
});


// Get Loan Officers from LenderX by using credentials and Data Profile
$(document).ready(function() {
  // Parameters for API request
  var parameters = {
    lx_user: 'shubham@vidyatech.com',
    APIKey: 'E5DEsSvAAgKowf52BjJqAg',
    APISecret: 'mupojP8O3yCkQX3mWv2nlA',
    BaseURL: 'https://app.sandbox1.lenderx-labs.com',
  };

  // AJAX request to fetch all orders
  $.ajax({
    url: `${api}/get_orders`,
    method: 'GET',
    data: parameters,
    success: function(data) {
      // Display fetched orders
      data=JSON.parse(data);
      data= data['data']
      displayOrders(data);
    },
    error: function(xhr, status, error) {
      console.error('Error fetching data from API:', error);
    }
  });
});


function formatTime(timeString) {
// Parse the time string into a Date object
const dateTime = new Date(timeString);

const formattedDate = dateTime.toLocaleDateString('en-GB', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

// Format the time in HH:mm AM/PM format
const formattedTime = dateTime.toLocaleTimeString('en-US', {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true
});

// Combine date and time into a single string
const formattedDateTime = `${formattedDate} ${formattedTime}`;
return formattedDateTime;
}
// Variable to keep track of the total number of rows
let totalRows = 0;

// Function to display orders in an accordion-style table
function displayOrders(jsonString) {
  // Parsing JSON string to object
  const orders = jsonString;
  console.log("orders", orders)
  const $accordionBody = $('#collapseOne .accordion-body .tbodyData');

  // Iterating through each order in the JSON data
  orders.map(info => {
    totalRows++;
    const order_id=info['appraisal_order_id']
    const createTime=info['application_file']['create_date']
    const user_id=info['application_file']['create_user_id']
    const due_date=info['lender_requested_delivery_date']
    const status=info['appraisal_status_value']
    const $row = $(`<tr class="OrderList" id="${order_id}"></tr>`);
    $row.append(`<td>${(formatTime(createTime))}</td>`);
    $row.append(`<td>${user_id}</td>`);
    $row.append(`<td>LenderX</td>`);
    $row.append(`<td></td>`);
    $row.append(`<td></td>`);
    $row.append(`<td>${due_date}</td>`);
    $row.append(`<td>${status}</td>`);
    $row.append(`<td><a href="#" class="view-order" data-order='${order_id}'>View</a></td>`);
    $accordionBody.append($row);

});
  
  // Event listener for clicking on a row to view order details
  $accordionBody.on('click', 'tr', async function() {
    $accordionBody.find('tr').not(this).removeClass('hover');
    $(this).toggleClass('hover');
    const orderId = $(this).attr('id');
    $('.OrderId').text(`Order ID: ${orderId}`);
    // const activity = await get_orderactivity(orderId);
  });

  // Updating total number of orders displayed
  $('#total_orders').text(`${totalRows} Items`);
}

// Event listener for clicking the "Create Order" button
$(document).on('click', '#CreateOrderButton', async function() {
  console.log("create clicked");
  openCreateUI("Create Order", "Create");
});

// Event listener for clicking on a specific order to view its details
$(document).on('click', '.view-order', async function() {
  const order_id = $(this).data('order');
  console.log("id: ", order_id);
  const orderData = await get_order(order_id);
  console.log("orderdata", orderData);
  openUIWithExistingValues(orderData, "View Order", "View");
});
// Function to fetch order data by order ID
  async function get_order(order_id) {
    var parameters = {
        lx_user: 'shubham@vidyatech.com',
        APIKey: 'E5DEsSvAAgKowf52BjJqAg',
        APISecret: 'mupojP8O3yCkQX3mWv2nlA',
        BaseURL: 'https://app.sandbox1.lenderx-labs.com',
        OrderId: order_id
    };

  try {
    // Making an AJAX request to fetch order data
      const data = await $.ajax({
          url: `${api}/get_order`, 
          method: 'GET',
          data: parameters
      });
      orderdata= JSON.parse(data);
      orderdata= orderdata['data']
      console.log(orderdata['application_file']['borrower_name'])
      return orderdata;
  } catch (error) {
      // Handling errors if API request fails
      console.error('Error fetching data from API:', error);
      throw error;
  }
}  
async function get_orderactivity(order_id) {
  var parameters = {
      LXUser: 'shubham@vidyatech.com',
      APIKey: 'E5DEsSvAAgKowf52BjJqAg',
      APISecret: 'mupojP8O3yCkQX3mWv2nlA',
      BaseURL: 'https://app.sandbox1.lenderx-labs.com',
      order_id: order_id
  };

try {
  // Making an AJAX request to fetch order data
    const data = await $.ajax({
        url: `${ap}/activity`, 
        method: 'GET',
        data: parameters
    });
    return data;
} catch (error) {
    // Handling errors if API request fails
    console.error('Error fetching data from API:', error);
    throw error;
}
}  

// Function to open a view modal with existing order data
async function openUIWithExistingValues(orderData, actionTitle, action) {
   // Remove data-toggle attribute and click event handlers from specific elements
  $('#contactentryMenuButton, #loanOfficerMenuButton, #loanTypeMenuButton, #loanPurposeMenuButton, #propertypeMenuButton, #FormMenuButton, #InvestorsMenuButton, #LoanProgramsMenuButton, #paymentMenuButton,  #watchersMenuButton, #datepicker').removeAttr('data-toggle');
  $('#contactentryMenuButton, #loanOfficerMenuButton, #loanTypeMenuButton, #loanPurposeMenuButton, #propertypeMenuButton, #FormMenuButton, #InvestorsMenuButton, #LoanProgramsMenuButton,#paymentMenuButton,   #watchersMenuButton, #datepicker').off('click');
  $('#contactName, #homePhone, #businessPhone, #cellPhone, #email').attr("disabled", true); 
  // Set action title and action in the modal
  document.getElementById('action-title').innerHTML = actionTitle;
  document.getElementById('action').innerHTML = action;
  // Initialize arrays for investors and forms
  var investorsArray = [];
  var FormsArray=[];
  // Extract data from orderData
  investorData= orderData['investors']
  investorData.map(inv=>{
    investorsArray.push(inv);
  });
  FormsData = orderData['forms']
  FormsData .map(form=>{
    description= form['description'] + ' -$' + form['quoted_amount']
    FormsArray.push(description);
  })
   // Extract other relevant data from orderData
    var b_name=orderData['application_file']['borrower_name'];
    var c_name= orderData['application_file']['coborrower_name'];
    var names = `${b_name}, ${c_name}`;
    var city=orderData['application_file']['address']['city'];
    var state =orderData['application_file']['address']['state_abbrev'];
    var street = orderData['application_file']['address']['line1'];
    var zip =orderData['application_file']['address']['zip'];
    var address=` ${street}, ${city}, ${state}, ${zip}`;
    var borrower_email=  orderData['application_file']['borrower_email'];
    var borrower_home_phone=  orderData['application_file']['borrower_home_phone'];
    var  borrower_mobile_phone=  orderData['application_file']['borrower_mobile_phone'];
    var  borrower_work_phone=  orderData['application_file']['borrower_work_phone'];
    var  coborrower_name=  orderData['application_file']['coborrower_name'];
    var coborrower_email=  orderData['application_file']['coborrower_email'];
    var  coborrower_home_phone=  orderData['application_file']['coborrower_home_phone'];
    var  coborrower_mobile_phone=  orderData['application_file']['coborrower_mobile_phone'];
    var coborrower_work_phone=  orderData['application_file']['coborrower_work_phone'];
    var create_date=  formatTime(orderData['application_file']['create_date']);
    var create_user_name=  orderData['forms'][0]['create_user_name'];
    var loan_amount=  orderData['application_file']['loan_amount'];
    var loan_number=  orderData['application_file']['loan_number'];
    var loan_officer_id=  orderData['application_file']['loan_officer_id'];
    var  loan_officer_name=  orderData['application_file']['loan_officer_name'];
    var loan_purpose_value=  orderData['application_file']['loan_purpose_value'];
    var  loan_type_value=  orderData['application_file']['loan_type']['description'];
    var  property_type=  orderData['application_file']['property_type']['description'];
    var  purchase_price=  orderData['application_file']['purchase_price'];
    var  realtor_alt_phone=  orderData['application_file']['realtor_alt_phone'];
    var realtor_contact=  orderData['application_file']['realtor_contact'];
    var  realtor_email=  orderData['application_file']['realtor_email'];
    var  realtor_home_phone=  orderData['application_file']['realtor_home_phone'];
    var  realtor_phone=  orderData['application_file']['realtor_phone'];
    var  appraisal_order_id=  orderData['appraisal_order_id'];
    var appraisal_status_value=  orderData['appraisal_status_value'];
    var appraiser_id=  orderData['appraiser_id'];
    var  comments=  orderData['comments'];
    var  due_date= orderData['lender_requested_delivery_date'];
    var estimated_value= orderData['application_file']['estimated_value'];
    var subtitle1= `${loan_number?loan_number:"Loan Number"} | ${names? names :"Borrower Name, Co-Borrower Name"} |${address? address:"Adress"}`
    var subtitle2= `${loan_type_value?loan_type_value:"Loan Type"} | ${loan_purpose_value?loan_purpose_value:'Loan Purpose'} | ${property_type?property_type :'Property Type'} | Investors:${investorsArray.length} | Loan Program` 
     // Populate modal with extracted data
    $("#newModal").on('shown.bs.modal', function () {
      // Populate various elements in the modal with extracted data
      var investorsMenuElement = document.getElementById('InvestorsMenu')
      var investorsHTML = '';
      var FormsMenuElement = document.getElementById('FormMenu')
      var FormsHTML = '';
      investorsArray.forEach(function(investor) {
          investorsHTML += `<span class="selected-tile">${investor}<span class="remove-tile" data-value=""><i class="bi bi-x"></i></span></span>`;
      });
      FormsArray.forEach(function(forms) {
        FormsHTML += `<span class="selected-tile">${forms}<span class="remove-tile" data-value=""><i class="bi bi-x"></i></span></span>`;
    });
      document.getElementById('Borrower').innerHTML = names;
      document.getElementById('Property Address').innerHTML = address;
      document.getElementById('Purchase Price').innerHTML= purchase_price;
      document.getElementById('Estimated Value').innerHTML = estimated_value
      document.getElementById('Loan Amount').innerHTML =loan_amount
      document.getElementById('Loan Number').innerHTML = loan_number
      document.getElementById('loanOfficerMenu').innerHTML = `<span class="selected-tile">${loan_officer_name}<span class="remove-tile" data-value=""><i class="bi bi-x"></i></span></span>`
      document.getElementById('loanTypeMenu').innerHTML =  `<span class="selected-tile">${loan_type_value}<span class="remove-tile" data-value=""><i class="bi bi-x"></i></span></span>`
      document.getElementById('LoanProgramsMenu').innerHTML = ""
      document.getElementById('loanPurposeMenu').innerHTML = `<span class="selected-tile">${loan_purpose_value}<span class="remove-tile" data-value=""><i class="bi bi-x"></i></span></span>`
      document.getElementById('LoanCreaterName').innerHTML = create_user_name
      document.getElementById('propertypeMenu').innerHTML=`<span class="selected-tile">${property_type}<span class="remove-tile" data-value=""><i class="bi bi-x"></i></span></span>`
      document.getElementById('subtitle1').innerHTML=subtitle1;
      document.getElementById('subtitle2').innerHTML=subtitle2;
      investorsMenuElement.innerHTML = investorsHTML;
      FormsMenuElement.innerHTML =FormsHTML;
      document.getElementById('datepicker').innerHTML=due_date;
});

  $("#newModal").modal('show');
}

// Function to send order data
async function sendorder() {;
   // Log origin data
  console.log("orrr",originData);
   // Extract selected investors' data
  const selectedInvestorsData = selectedInvestors.map(investor => user_id= investor.user_id);
  console.log(selectedInvestors)
  // Extract selected form data
  const selectedFormData = selectedForms;
  const selectedWatchersData = selectedWatchers.map(watcher =>
  user_id= watcher.user_id);
    // Get origination context
  let originationContext = await transactionObject.getOrigin();
  if (!originationContext.id) {
    console.log("refresh")
    originationContext = await transactionObject.refreshOrigin();
  }
  // Check if origination context has transaction ID, update or create transaction accordingly
  if(originationContext.transactionId)
  {
      transaction_id=await updateTrans(originationContext.transactionId);
  }
  else
  {
    transaction_id= await createTransaction(selectedInvestorsData, selectedWatchersData, selectedFormData);
  }
  console.log("transac", transaction_id);
    // Close transaction object
await transactionObject.close();
}
// Method to create a transaction for EPC
async function createTransaction(selectedInvestorsData, selectedWatchersData,selectedFormData) {
  // Map loan type and loan purpose
  var loanTypeValue=mapLoanType(document.getElementById("loanTypeMenuButton").textContent.replace(/\s+/g, ' ').trim());
  var loanPurpose=mapLoanPurpose(document.getElementById("loanPurposeMenuButton").textContent);
  // console
  console.log("loanType", loanTypeValue)
  try{
    let transactionId;
    const transactionRequest = {
        request: {
          type: "Appraisal",
        options: {
          customStringOption: 'Additional Data',
          customObjectOption: [
            {
              customRealStateoptions:{
                customFirstName:document.getElementById("contactName").value || "",
                customHomePhone:document.getElementById("homePhone").value || "",
                customWorkPhone:document.getElementById("businessPhone").value || "",
                customCellPhone:document.getElementById("cellPhone").value || "",
                customEmail:document.getElementById("email").value || "",            
            },
            },
            {
              CustomLoanDetails:{
                loanPurpose:document.getElementById("loanPurposeMenuButton").textContent.replace(/\s+/g, ' ').trim() || "",
                loan_officer_id:selectedDropdownValues['loanOfficer'] || "",
                loan_programs:document.getElementById("LoanProgramsMenuButton").textContent.replace(/\s+/g, ' ').trim() || "",
                loanType: loanTypeValue || "",
                instruction:document.getElementById('textareaInput').value || "",
                dueDate:document.getElementById("datepicker").value || "",
                investors_id: selectedInvestorsData || "",
                Form:selectedFormData || "",
                WatchersId:selectedWatchersData || "",
                propertyType:document.getElementById("propertypeMenuButton").textContent || "",
                payment:document.getElementById("paymentMenuButton").textContent || "",
                property_type_id: PropertyTypeId,
                loanProgramId: loanProgramId
            }
            }
          ]
        },
        resources:actionResult
      },
    };
    // Create transaction
     const transactionData = await transactionObject.create(transactionRequest);
    transactionId = transactionData.id;
    return transactionId;
  }
  catch(error)
  {
      console.error('Error in create Trans:', error);
  }
}

// Method to update a transaction for EPC if something changes
async function updateTrans(transactionId) {
  try {
      const transactionRequest = {
          request: {
              type: "Appraisal",
          }
      };
       // Update transaction
      const transactionData = await transactionObject.update(transactionRequest);
      transactionId = transactionData.id;
      return transactionId;
  } catch (error) {
      console.error('Error in updateTrans:', error);
  }
}

window.addEventListener('load', function() {
  // Get the button that toggles the collapse/expand of the Orders section
  var accordionButton = document.querySelector('#headingOne button');
  // Trigger the click event on the button to open the accordion
  accordionButton.click();
});
selectedInvestors = []
selectedWatchers=[]
selectedForms=[]
let selectedDropdownValues = {};

// Function to populate a dropdown menu with data
function populateDropdown(dropdownId, data, key,id) {
     // Initialize variables
  let selectedValue = null;
  let previousValue = null;
  let selectedId = null;
  var val,name;
   // Access the dropdown element and its associated menu button
  const dropdown = $(`#${dropdownId}Dropdown`);
  const menuButton = $(`#${dropdownId}Menu`);
 // Clear the dropdown menu
  dropdown.empty();
   // Check if the dropdown is for loan officers
    data.map(info => {
      name = info[key]
      val = info[id]
      dropdown.append(`<li><a class="${dropdownId}-item" href="#" data-value="${val}">${name}</a></li>`);
  });
  // Handle click events for dropdown items
  $(`.${dropdownId}-item`).click(function () {
    const clickedValue = $(this).text();
    const clickedId = $(this).data('value');
    if (clickedValue !== selectedValue && clickedValue !== selectedDropdownValues[dropdownId]) {
      if (selectedValue != null) {
        previousValue = selectedValue;
      }
      // Update selected values and hide the dropdown menu
      selectedValue = clickedValue;
      selectedId = clickedId;
      selectedDropdownValues[dropdownId] = clickedId;
      console.log(selectedDropdownValues[dropdownId]);
      updateWithTile();
      $(this).parent().hide();
    }
  });
   // Handle click events for removing selected items
  menuButton.on('click', '.remove-tile', function () {
    // Remove the selected item and update the dropdown menu
    const reselectedValue = $(this).text().trim();
    selectedValue = null;
    selectedId = null;
    $(this).remove();
    dropdown.find(`.${dropdownId}-item:contains('${reselectedValue}')`).parent().show();
    updateWithTile();
  });

  function updateWithTile() {
    const tileHtml = selectedValue
      ? `<span class="selected-tile">${selectedValue}<span class="remove-tile" data-value="${selectedId}"><i class="bi bi-x"></i></span></span>`
      : '';
    // const downArrowHtml = `<span class="spancm ml-auto"><i class="bi bi-chevron-down"></i></span>`;
    menuButton.html(tileHtml);
    if (previousValue) {
      dropdown.find(`.${dropdownId}-item:contains('${previousValue}')`).parent().show();
    }
  }
}


// Function to fetch loan officers data and populate the corresponding dropdown
$(document).ready(function () {
  var parameters = {
    lx_user: 'shubham@vidyatech.com',
    APIKey: 'E5DEsSvAAgKowf52BjJqAg',
    APISecret: 'mupojP8O3yCkQX3mWv2nlA',
    BaseURL: 'https://app.sandbox1.lenderx-labs.com',
  };
 // AJAX call to fetch loan officers data
  $.ajax({
    url: `${api}/get_loan_officer`,
    method: 'GET',
    data: parameters,
    success: function (data) {
      data=JSON.parse(data)
      data=data['data']
      console.log("loanofficer",data)
     // Populate the loan officer dropdown with fetched data
      populateDropdown('loanOfficer', data, 'name','user_id');
    },
    error: function (xhr, status, error) {
      console.error('Error fetching data from API:', error);
    }
  });
});
let PropertyTypeId,loanProgramId
$('#loanOfficerDropdown').on('click', '.loanOfficer-item', async function () {
  const selectedUserId = await $(this).data('value');
  selectedWatchers = [];
 await  getWatchers(selectedUserId);
});
$('#propertypeDropdown').on('click', '.propertype-item', async function () {
   PropertyTypeId = await $(this).data('value');
});
$('#LoanProgramsDropdown').on('click', '.LoanPrograms-item', async function () {
   loanProgramId = await $(this).data('value');
});

// Get Loan Types AJAX Call  from LenderX  by using credentials
$(document).ready(function () {
  var parameters = {
    lx_user: 'shubham@vidyatech.com',
    APIKey: 'E5DEsSvAAgKowf52BjJqAg',
    APISecret: 'mupojP8O3yCkQX3mWv2nlA',
    BaseURL: 'https://app.sandbox1.lenderx-labs.com',
  };
  $.ajax({
    url: `${api}/get_loan_types`,
    method: 'GET',
    data: parameters,
    success: function (LoanTypedataResponse) {
      LoanTypedata=JSON.parse(LoanTypedataResponse)
      LoanTypedata=LoanTypedata['data']
      populateDropdown('loanType', LoanTypedata, 'description','display_sequence');
    },
    error: function (xhr, status, error) {
      console.error('Error fetching data from API:', error);
    }
  });
});

// Get Loan Purpose AJAX Call  from LenderX  by using credentials
$(document).ready(function () {
  var parameters = {
    lx_user: 'shubham@vidyatech.com',
    APIKey: 'E5DEsSvAAgKowf52BjJqAg',
    APISecret: 'mupojP8O3yCkQX3mWv2nlA',
    BaseURL: 'https://app.sandbox1.lenderx-labs.com',
  };
  $.ajax({
    url: `${api}/get_loan_purpose`,
    method: 'GET',
    data: parameters,
    success: function (loanPurposeDataResponse) {
      loanPurposeData=JSON.parse(loanPurposeDataResponse)
      loanPurposeData=loanPurposeData['data']
      populateDropdown('loanPurpose', loanPurposeData, 'appraisal_purpose_value','display_sequence');
    },
    error: function (xhr, status, error) {
      console.error('Error fetching data from API:', error);
    }
  });
});
// Get Property Type AJAX Call  from LenderX  by using credentials
$(document).ready(function () {
  var parameters = {
    lx_user: 'shubham@vidyatech.com',
    APIKey: 'E5DEsSvAAgKowf52BjJqAg',
    APISecret: 'mupojP8O3yCkQX3mWv2nlA',
    BaseURL: 'https://app.sandbox1.lenderx-labs.com',
  };
  $.ajax({
    url: `${api}/get_property_type`,
    method: 'GET',
    data: parameters,
    success: function (propertydataResponse) {
       propertydata=JSON.parse(propertydataResponse)
       propertydata= propertydata['data']
      
      populateDropdown('propertype', propertydata, 'description','property_type_id');
    },
    error: function (xhr, status, error) {
      console.error('Error fetching data from API:', error);
    }
  });
});
$('#loanTypeDropdown').on('click', '.loanType-item', async function () {
  const selectedLoanType = await $(this).text();
  await getForms(selectedLoanType.toLowerCase());
});

// Get Forms AJAX Call  from LenderX  by using credentials
async function getForms(selectedLoanType)  {
  var parameters = {
    lx_user: 'shubham@vidyatech.com',
    APIKey: 'E5DEsSvAAgKowf52BjJqAg',
    APISecret: 'mupojP8O3yCkQX3mWv2nlA',
    BaseURL: 'https://app.sandbox1.lenderx-labs.com',
    // city: 'Milwaukee',
    // state_abbrev: 'WI',
    // zipcode: 53207,
    loan_type_value:  selectedLoanType,
    city: originData.loan.property.city,
    state_abbrev:originData.loan.property.streetAddress,
    zipcode: originData.loan.property.postalCode,
  };
  $.ajax({
    url: `${api}/get_forms`,
    method: 'GET', 
    data: parameters,
    success: function (data) {
      data=JSON.parse(data)
      data=data['data']
      const dropdown = $('#FormDropdown');
      const FormMenuButton = $('#FormMenu');
      dropdown.empty();
      data.map(info => {
          const dataObject = {
          description: info['description'],
          amount: info['amount'],
          display_order: info['form']['display_order'],
          appraisal_type_value: info['form']['appraisal_type_value'],
          loan_type_value: info['form']['loan_type_value'],
          expanded_description: info['form']['expanded_description'],
        };
        form_name= dataObject.description +" -$" + dataObject.amount;
        const option = `<li><a class="Form-item" href="#" data-object='${JSON.stringify(dataObject)}'>${form_name}</a></li>`;
        console.log(dataObject)
        dropdown.append(option);
    }); 
      FormMenuButton.on('click', '.remove-tile', function () {
        const removedObject = $(this).data('object');
        removeValue(removedObject);
        updateLoanButtonWithTiles();
      });

      dropdown.on('click', '.Form-item', function () {
        const clickedObject = $(this).data('object');
        toggleValue(clickedObject);
        updateLoanButtonWithTiles();
        $(this).parent().remove();
      });

      function toggleValue(object) {
        const index = selectedForms.findIndex(v => v.description === object.description);
        if (index === -1) {
          selectedForms.push(object);
        } else {
          selectedForms.splice(index, 1);
        }

        const correspondingItem = dropdown.find(`.Form-item:contains('${object.description}')`);
        correspondingItem.toggleClass('selected', index === -1);
      }

      function removeValue(object) {
        selectedForms = selectedForms.filter(v => v.description !== object.description);
        const correspondingItem = dropdown.find(`.Form-item:contains('${object.description}')`);
        correspondingItem.removeClass('selected');
      
        const option = `<li><a class="Form-item" data-object='${JSON.stringify(object)}' href="#">${object.description}</a></li>`;
        dropdown.append(option);
      }

      function updateLoanButtonWithTiles() {
        const tilesHtml = selectedForms.map(object => `
          <span class="selected-tile">${object.description}
            <span class="remove-tile" data-object='${JSON.stringify(object)}'>
              <i class="bi bi-x"></i>
            </span>
          </span>`).join('');
        const updatedButtonHtml = `<div class="dynamic-height-button">${tilesHtml}</div>`;
        FormMenuButton.html(updatedButtonHtml);
        var button = document.getElementById('FormMenuButton');
        var span = button.querySelector('.spanca');
        if (button && span) {
          span.classList.remove('spanca');
          span.classList.add('spancm');
        }
        const buttonHeight = button.height();
        if (buttonHeight > 50) {
          $('.spancm').css({
            right: 5,
            bottom: 10,
          });
          $('.spancm .bi-chevron-down').css({
            height: 40,
          })
        } else {
          $('.spancm').css({
            top: 2,
            right: 5,
            bottom: 10,
          });
        }
      }
    },
    error: function (xhr, status, error) {
      console.error('Error fetching data from API:', error);
    }
  });
};

// Get Investors AJAX Call  from LenderX  by using credentials
$(document).ready(function () {
  
  var parameters = {
    lx_user: 'shubham@vidyatech.com',
    APIKey: 'E5DEsSvAAgKowf52BjJqAg',
    APISecret: 'mupojP8O3yCkQX3mWv2nlA',
    BaseURL: 'https://app.sandbox1.lenderx-labs.com',
  };
  $.ajax({
    url: `${api}/get_investors`,
    method: 'GET',
    data: parameters,
    success: function (data) {
      data=JSON.parse(data)
      data=data['data']
      const dropdown = $('#InvestorsDropdown');
      const InvestorsMenuButton = $('#InvestorsMenu');
      data.map(info => {
        const name = info['name']
       const userId = info['available_investor_id']
       const option = `<li><a class="Investors-item" data-user-id="${userId}" href="#">${name}</a></li>`;
         dropdown.append(option);
        });
      InvestorsMenuButton.on('click', '.remove-tile', function () {
        const removedValue = $(this).data('value');
        const removedUserId = $(this).data('user-id'); // Added line to get user ID
        removeValue(removedValue, removedUserId);
        updateINVButtonWithTiles();
      });
      dropdown.on('click', '.Investors-item', function () {
        const clickedValue = $(this).text();
        const clickedUserId = $(this).data('user-id');
        toggleValue(clickedValue, clickedUserId);
        updateINVButtonWithTiles();
        $(this).parent().remove();
      });
      function toggleValue(value,userId) {
        const index = selectedInvestors.findIndex(investor=>investor.user_id===userId);
        if (index === -1) {
          selectedInvestors.push({user_id: userId,value});
        } else {
          selectedInvestors.splice(index, 1);
        }

        const correspondingItem = dropdown.find(`.Investors-item:contains('${value}')`);
        correspondingItem.toggleClass('selected', index === -1);
      }

      function removeValue(value,userId) {
        selectedInvestors = selectedInvestors.filter(investor => investor.value !== value || investor.user_id !== userId);
        const correspondingItem = dropdown.find(`.Investors-item:contains('${value}')`);
        correspondingItem.removeClass('selected');
      
        const option = `<li><a class="Investors-item" data-user-id="${userId}" href="#">${value}</a></li>`;
        dropdown.append(option);
      }
      function updateINVButtonWithTiles() {
        const tilesHtml = selectedInvestors.map(investor => `
        <span class="selected-tile" data-user-id="${investor.user_id}">
          ${investor.value}
          <span class="remove-tile" data-value="${investor.value}" data-user-id="${investor.user_id}">
            <i class="bi bi-x"></i>
          </span>
        </span>`
      ).join('');        
        InvestorsMenuButton.html(tilesHtml);
       
      }
    },
    error: function (xhr, status, error) {
      console.error('Error fetching data from API:', error);
    }
  });
});

// Get Watchers AJAX Call  from LenderX  by using credentials
$(document).ready(function () {
  var parameters = {
    lx_user: 'shubham@vidyatech.com',
    APIKey: 'E5DEsSvAAgKowf52BjJqAg',
    APISecret: 'mupojP8O3yCkQX3mWv2nlA',
    BaseURL: 'https://app.sandbox1.lenderx-labs.com',
  };
  $.ajax({
    url: `${api}/get_loan_programs`,
    method: 'GET',
    data: parameters,
    success: function (loanProgramsdataResponse) {
      loanProgramsdata=JSON.parse(loanProgramsdataResponse)
      loanProgramsdata=loanProgramsdata['data']
        populateDropdown('LoanPrograms', loanProgramsdata, 'loan_program_name','loan_program_id');
    },
    error: function (xhr, status, error) {
      console.error('Error fetching data from API:', error);
    }
  });
});

// Get Watchers Call from LenderX  by using credentials and Loan Offficer Id
async function getWatchers(selectedloanOfficerId) {
  console.log(selectedloanOfficerId)
  var parameters = {
    lx_user: 'shubham@vidyatech.com',
    APIKey: 'E5DEsSvAAgKowf52BjJqAg',
    APISecret: 'mupojP8O3yCkQX3mWv2nlA',
    BaseURL: 'https://app.sandbox1.lenderx-labs.com',
    LoanOfficerId:selectedloanOfficerId
  };
  $.ajax({
    url: `${api}/get_watchers`,
    method: 'GET',
    data: parameters,
    success: function (data) {
      data=JSON.parse(data)
      data=data['data']
      const dropdown = $('#watchersDropdown');
      const watchersMenuButton = $('#watchersMenu');
      data.map(info => {
        const name = info['name']
        const  userId = info['user_id']
        const option = `<li><a class="watchers-item" data-user-id="${userId}" href="#">${name}</a></li>`;
        dropdown.append(option);
    });
      watchersMenuButton.on('click', '.remove-tile', function () {
        const removedValue = $(this).data('value');
        const removedUserId = $(this).data('user-id'); 
        removeValue(removedValue, removedUserId);
        updatewatchersButtonWithTiles();
      });
      dropdown.on('click', '.watchers-item', function () {
        const clickedValue = $(this).text();
        const clickedUserId = $(this).data('user-id');
        toggleValue(clickedValue, clickedUserId);
        updatewatchersButtonWithTiles();
        $(this).parent().remove();
      });
      function toggleValue(value, userId) {
        const index = selectedWatchers.findIndex(watcher => watcher.user_id === userId);
        if (index === -1) {
          selectedWatchers.push({ user_id: userId, value });
        } else {
          selectedWatchers.splice(index, 1);
        }
      
        const correspondingItem = dropdown.find(`.watchers-item:contains('${value}')`);
        correspondingItem.toggleClass('selected', index === -1);
      }
      

      function removeValue(value,userId) {
        selectedWatchers = selectedWatchers.filter(watcher => watcher.value !== value);
        const correspondingItem = dropdown.find(`.watchers-item:contains('${value}')`);
        correspondingItem.removeClass('selected');

        const option = `<li><a class="watchers-item" data-user-id="${userId}" href="#">${value}</a></li>`;
        dropdown.append(option);
      }
      function updatewatchersButtonWithTiles() {
        const tilesHtml = selectedWatchers.map(watcher => `
        <span class="selected-tile" data-user-id="${watcher.user_id}">
        ${watcher.value}
        <span class="remove-tile" data-value="${watcher.value}" data-user-id="${watcher.user_id}">
        <i class="bi bi-x"></i></span>
        </span>`).join('');
        const updatedButtonHtml = `<div class="dynamic-height-button">${tilesHtml}</div>`;
        watchersMenuButton.html(updatedButtonHtml);
      var button = document.getElementById('watchersMenuButton');
      var span = button.querySelector('.spanc');
      if (button && span) {
        span.classList.remove('spanc');
        span.classList.add('spancm');
      }
        const buttonHeight = watchersMenuButton.height();
        if (buttonHeight > 50) {
          $('.spancm').css({
            right: 5,
            bottom: 10,
          });
          $('.spancm .bi-chevron-down').css({
            height: 40,
          })
        } else {
          $('.spancm').css({
            top: 2,
            right: 5,
            bottom: 10,
          });
        }
      }
    },
    error: function (xhr, status, error) {
      console.error('Error fetching data from API:', error);
    }
  });
};
let rowData = []; // Array to store details of each row

async function addToTable() {
  const tableBody = document.getElementById('dataTableBody');
  adddocuments.forEach((doc,index) => {
    const inputValue = doc['name'];
    const newRow = document.createElement('tr');
    const cell1 = document.createElement('td');
    const cell2 = document.createElement('td');
    const cell3 = document.createElement('td');
    const cell4 = document.createElement('td');
    cell1.textContent = inputValue;

    const dropdownId = 'DocumentTypeDropdown_' + index;
    var dropdownClone = document.querySelector('.DocumentType').cloneNode(true);
    dropdownClone.id = dropdownId;
    dropdownClone.style.display = "block";
    cell2.appendChild(dropdownClone);
    console.log(dropdownClone)
    const dropdownButton = dropdownClone.querySelector('#DocumentTypeMenuButton');
    const dropdown = dropdownClone.querySelector('#DocumentTypeDropdown');
    dropdownButton.setAttribute('data-row-index', index);
    dropdown.setAttribute('data-row-index', index);
    console.log("after",dropdownClone)
    const viewLink = document.createElement('a');
    viewLink.textContent = 'View';
    viewLink.href = '#';
    viewLink.addEventListener('click', function () {
      openDocViewer(doc['id']);
    });
    cell3.appendChild(viewLink);
    cell4.innerHTML = '<i class="bi bi-x-lg"></i>';
    cell4.addEventListener('click', function () {
      newRow.remove();
      const index = rowData.findIndex(data => data.inputValue === inputValue);
      rowData.splice(index, 1);
    });

    newRow.appendChild(cell1);
    newRow.appendChild(cell2);
    newRow.appendChild(cell3);
    newRow.appendChild(cell4);

    tableBody.appendChild(newRow);

    // Add details of the current row to rowData array
    rowData.push({
      name: inputValue,
      id: doc['name'],
      mimeType: doc['mimeType'],
      type: 'Document Type'
    });
  });
}
$(document).ready(function() {
    let selectedDocValue = null;
    let previousDocValue = null;
    let selectedDocId = null;
    var dropdown, menuButton, rowIndex;
  // Attach click event to the document
  $(document).on('click', '.DocumentTypeMenuButton', function() {
    rowIndex = $(this).data('row-index');
    $(this).attr('id', 'DocumentTypeMenuButton_' + rowIndex);
    console.log("drop", $(this));
    dropdown= $(`#DocumentTypeMenuButton_${rowIndex} .dropdown-menu`)
    menuButton= $(`#DocumentTypeMenuButton_${rowIndex} .ab`)
    console.log(dropdown,"nbcd", menuButton)
  });
    
  // Filter click events on .DocumentType-item within #DocumentTypeMenuButton
  $(document).on('click', `#DocumentTypeMenuButton_${rowIndex} .DocumentType-item`, function() {
    console.log($(this).text())
    const clickedValue = $(this).text();
    const clickedId = $(this).data('val');
    if (clickedValue !== selectedDocValue) {
      if (selectedDocValue != null) {
        previousDocValue = selectedDocValue;
      }
      selectedDocValue = clickedValue;
      selectedDocId = clickedId;
      updateDocWithTile();
      $(this).parent().hide();
    }
  });
  function updateDocWithTile() {
    console.log('selected', selectedDocValue)
    const tileHtml = selectedDocValue
      ? `<span class="selected-tile">${selectedDocValue}<span class="remove-tile" data-value="${selectedDocId}"><i class="bi bi-x"></i></span></span>`
      : '';
    menuButton.html(tileHtml);
    if (previousDocValue) {
      dropdown.find(`.DocumentType-item:contains('${previousDocValue}')`).parent().show();
    }
  }
  menuButton.on('click', '.remove-tile', function () {
    // Remove the selected item and update the dropdown menu
    const reselectedDocValue = $(this).text().trim();
    selectedDocValue = null;
    selectedDocId = null;
    $(this).remove();
    rowData[rowIndex].type = " ";
    dropdown.find(`.DocumentType-item:contains('${reselectedDocValue}')`).parent().show();
    updateDocWithTile();
  });
  rowData[rowIndex].type = selectedDocValue;
});

// Get Loan Documents AJAX Call from Lenderx By using credentials
var api = 'https://qwm77czhm1.execute-api.us-east-1.amazonaws.com/LenderXTesting';
$(document).ready(function() {
  console.log('dopdown clicked')
  var parameters = {
    lx_user: 'shubham@vidyatech.com',
    APIKey: 'E5DEsSvAAgKowf52BjJqAg',
    APISecret: 'mupojP8O3yCkQX3mWv2nlA',
    BaseURL: 'https://app.sandbox1.lenderx-labs.com',
  };
  $.ajax({
    url: `${api}/get_loan_document`,
    method: 'GET',
    data: parameters,
    success: function (data) {
      data=JSON.parse(data)
      data=data['data']
      const dropdown = $('#DocumentTypeDropdown');
      // const DocumentTypeMenuButton = $('#DocumentTypeMenu');
      data.map(info => {
        const name = info['description']
        const  val = info['document_type']
        const option = `<li><a class="DocumentType-item" data-val="${val}" href="#">${name}</a></li>`;
        dropdown.append(option);
    });
      // populateDropdown('DocumentType', data, 'description','document_type');
    },
    error: function (xhr, status, error) {
      console.error('Error fetching data from API:', error);
    }
  });
});
$(document).ready(function () {
  var parameters = {
    lx_user: 'shubham@vidyatech.com',
    APIKey: 'E5DEsSvAAgKowf52BjJqAg',
    APISecret: 'mupojP8O3yCkQX3mWv2nlA',
    BaseURL: 'https://app.sandbox1.lenderx-labs.com',
  };
  $.ajax({
    url: `${api}/get_payment`,
    method: 'GET',
    data: parameters,
    success: function (data) {
      data=JSON.parse(data)
      data=data['data']
      console.log(data)
      populatePaymentDropdown('payment', data, 'name','preference');
    },
    error: function (xhr, status, error) {
      console.error('Error fetching data from API:', error);
    }
  });
});

function populatePaymentDropdown(dropdownId, data) {
  // Initialize variables
  let selectedPaymentValue = null;
  let previousPaymentValue = null;
  let selectedPaymentId = null;
  var val,name;
  // Access the dropdown element and its associated menu button
  const dropdown = $(`#paymentDropdown`);
  const menuButton = $(`#paymentMenu`);
  // Clear the dropdown menu
  dropdown.empty();
  // Check if the dropdown is for loan officers
  data.map(info => {
    name = info['name']
    val = info['receives_email']
    dropdown.append(`<li><a class="payment-item" href="#" data-receives_email="${val}">${name}</a></li>`);
  });
  // Handle click events for dropdown items
  $(`.payment-item`).click(function () {
  const clickedValue = $(this).text();
  const clickedId = $(this).data('receives_email');
  let emailInput= document.querySelector('.EmailInput')
  if(clickedId === 1)
  {
    emailInput.style.display = "block";
    $('#emailInput').val(originData.loan.appications[0]?.borrower?.emailAddressText);
  }
  else{
    emailInput.style.display = "none";
  }

  if (clickedValue !== selectedPaymentValue && clickedValue !== selectedDropdownValues['payment']) {
    if (selectedPaymentValue != null) {
      previousPaymentValue = selectedPaymentValue;
    }
    // Update selected values and hide the dropdown menu
    selectedPaymentValue = clickedValue;
    selectedPaymentId = clickedId;
    selectedDropdownValues['payment'] = clickedId;
    console.log(selectedDropdownValues['payment']);
    updateWithTile();
    $(this).parent().hide();
  }
  });
  // Handle click events for removing selected items
  menuButton.on('click', '.remove-tile', function () {
  // Remove the selected item and update the dropdown menu
  const reselectedPaymentValue = $(this).text().trim();
  selectedPaymentValue = null;
  selectedPaymentId = null;
  $(this).remove();
  dropdown.find(`.payment-item:contains('${reselectedPaymentValue}')`).parent().show();
  updateWithTile();
});

function updateWithTile() {
 const tileHtml = selectedPaymentValue
   ? `<span class="selected-tile">${selectedPaymentValue}<span class="remove-tile" data-value="${selectedPaymentId}"><i class="bi bi-x"></i></span></span>`
   : '';
 // const downArrowHtml = `<span class="spancm ml-auto"><i class="bi bi-chevron-down"></i></span>`;
 menuButton.html(tileHtml);
 if (previousPaymentValue) {
   dropdown.find(`.payment-item:contains('${previousPaymentValue}')`).parent().show();
 }
}
}