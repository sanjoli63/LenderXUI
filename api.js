let Token;
export async function partner_token(token_val) {
    Token=token_val;
    console.log("get Token", token_val)
}

export async function orderCreation(url)
{
    let transactionData= await GetTransactionData(url);
    console.log(transactionData);
    createOrder(transactionData.request)
}
// Get Transaction AJAX Call
async function GetTransactionData(url) {
    try {
        console.log("sadsad");
        const response = await fetch(`${url}?view=complete`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${Token}`,
                'Access-Control-Allow-Origin':'*'
            },
        });

        const responseData = await response.json();
        console.log("trans",responseData);
        return responseData;
    } catch (error) {
        console.log('Error in TransactionRequest1:', error);
        throw error;
    }
}

//   Create Order LenderX Call using  all data which are filled in form, we get these variables data from Frontend
async function createOrder(data){
   console.log("datata",data.options.customObjectOption);
   var borrower_first_name = data.loan.applications[0]?.borrower?.firstName || '';
        var borrower_last_name = data.loan.applications[0]?.borrower?.lastName || '';
        var borrower_home_phone = data.loan.applications[0]?.borrower?.homePhoneNumber || '';
        var borrower_work_phone = data.loan.applications[0]?.borrower?.phoneNumber || '';
        var borrower_mobile_phone = data.loan.applications[0]?.borrower?.cell || '';
        var borrower_email = data.loan.applications[0]?.borrower?.emailAddressText || 'test@test.com';

        var coborrower_first_name = data.loan.applications[0]?.coborrower?.firstName || 'Test2';
        var coborrower_last_name = data.loan.applications[0]?.coborrower?.lastName || 'Order';
        var coborrower_home_phone = data.loan.applications[0]?.coborrower?.homePhoneNumber || '917033471111';
        var coborrower_work_phone = data.loan.applications[0]?.coborrower?.phoneNumber || '917033471111';
        var coborrower_mobile_phone = data.loan.applications[0]?.coborrower?.cell || '917033471111';
        var coborrower_email = data.loan.applications[0]?.coborrower?.emailAddressText || 'te@test.com';
        var name= data.options?.customObjectOption[0]?.customRealStateoptions?.customFirstName || 'Test2 Order';
        var nameParts = name.split(" ");
        var real_first_name =nameParts[0];
        var real_last_name=nameParts.slice(1).join(" ");
        var real_home_phone = data.options?.customObjectOption[0]?.customRealStateoptions?.customHomePhone || '917033471111';
        var real_work_phone = data.options?.customObjectOption[0]?.customRealStateoptions?.customWorkPhone || '917033471111';
        var real_mobile_phone = data.options?.customObjectOption[0]?.customRealStateoptions?.customCellPhone || '917033471111';
        var real_email = data.options?.customObjectOption[0]?.customRealStateoptions?.customEmail || 'te@test.com';

        var zip = data.loan.property?.postalCode || '90017';
        var city = data.loan.property?.city || 'Los Angeles';
        var state_abbrev = data.loan.property?.state || 'CA';
        var line1 = data.loan.property?.streetAddress || '1 Test St.';
        var loanPurpose = data.options?.customObjectOption[1]?.CustomLoanDetails?.loanPurpose || 'Purchase';

        var loan_amount = data.loan?.borrowerRequestedLoanAmount || '150000';
        var loan_number = data.loan?.loanNumber || '234123123';
        var loan_officer_id = data.options?.customObjectOption[1]?.CustomLoanDetails?.loan_officer_id || '62160';
        var loan_programs = data.options?.customObjectOption[1]?.CustomLoanDetails?.loan_programs || '1';
        var purchase_price = data.loan?.purchasePriceAmount || '199999';
        var loanType = data.options?.customObjectOption[1]?.CustomLoanDetails?.loanType || 'conventional';
        var instruction = data.options?.customObjectOption[1]?.CustomLoanDetails?.instruction || "";
        var dueDate = data.options?.customObjectOption[1]?.CustomLoanDetails?.dueDate || "";
        var property_id = data.options?.customObjectOption[1]?.CustomLoanDetails?.propertyType || "";
        var estimated_value = data.loan?.estimatedvalue || "";
    const formsXML = data.options?.customObjectOption[1]?.CustomLoanDetails?.Form.map(
        form => `<no_delete>false</no_delete>
                <display_order>${form.display_order}</display_order>    
                <appraisal_type_value>${form.appraisal_type_value}</appraisal_type_value>
                <loan_type_value>${form.loan_type_value}</loan_type_value>
                <description>${form.description}</description>
                <item_id />
                <amount>${form.amount}</amount>
                <expanded_description>${form.expanded_description}</expanded_description>
                <quoted_amount></quoted_amount>
                <refundable>true</refundable> `).join('');
    const investorsXML = data.options?.customObjectOption[1]?.CustomLoanDetails?.investors_id.map(id => `<available_investor_id>${id}</available_investor_id>`).join('\r\n')|| "";

    const watchersXML = data.options?.customObjectOption[1]?.CustomLoanDetails?.WatchersId.map(
        id => `<watchers>${id}</watchers>`).join('\r\n') || "";
   


    const myHeaders = new Headers();

    myHeaders.append("Content-Type", "application/xml");
   
    const raw = `<?xml version=\"1.0\"?>
    <request xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\">    
    <application_file>        
        <borrower_first_name>${borrower_first_name}</borrower_first_name>        
        <borrower_last_name>${borrower_last_name}</borrower_last_name>        
        <borrower_middle_name></borrower_middle_name>        
        <borrower_home_phone>${borrower_home_phone}</borrower_home_phone>      
        <borrower_work_phone>${borrower_work_phone}</borrower_work_phone>        
        <borrower_mobile_phone>${borrower_mobile_phone}</borrower_mobile_phone>        
        <borrower_email>${borrower_email}</borrower_email>        
        <coborrower_first_name>${coborrower_first_name}</coborrower_first_name>        
        <coborrower_middle_name></coborrower_middle_name>        
        <coborrower_last_name>${coborrower_last_name}</coborrower_last_name>        
        <coborrower_home_phone>${coborrower_home_phone}</coborrower_home_phone>        
        <coborrower_work_phone>${coborrower_work_phone}</coborrower_work_phone>        
        <coborrower_mobile_phone>${coborrower_mobile_phone}</coborrower_mobile_phone>            
        <real_estate_agent_first_name>${real_first_name}</real_estate_agent_first_name>        
        <real_estate_agent_middle_name></real_estate_agent_middle_name>        
        <real_estate_agent_last_name>${real_last_name}</real_estate_agent_last_name>        
        <real_estate_agent_home_phone>${real_home_phone}</real_estate_agent_home_phone>        
        <real_estate_agent_work_phone>${real_work_phone}</real_estate_agent_work_phone>        
        <real_estate_agent_cell_phone>${real_mobile_phone}</real_estate_agent_cell_phone>        
        <real_estate_agent_email>${real_email}</real_estate_agent_email>  
        <address>      
            <zip>${zip}</zip>            
            <city>${city}</city>            
            <state_abbrev>${state_abbrev}</state_abbrev>            
            <line1>${line1}</line1>            
            <line2></line2>        
        </address>        
        <investors>            
            ${investorsXML}  
        </investors>      
        <loan_type_value>${loanType}</loan_type_value>        
        <property_type_id>1</property_type_id>        
        <loan_amount>${loan_amount}</loan_amount>        
        <loan_number>${loan_number}</loan_number>        
        <loan_officer_id>${loan_officer_id}</loan_officer_id>        
        <loan_programs>1</loan_programs>        
        <loan_purpose_value>${loanPurpose}</loan_purpose_value>        
        <purchase_price>${purchase_price}</purchase_price>        
        <estimated_value>${estimated_value}</estimated_value>        
        ${watchersXML}      
        <extension></extension>        
        <do_not_submit_to_ead>true</do_not_submit_to_ead>        
        <do_not_submit_to_ucdp>true</do_not_submit_to_ucdp>        
        <duplicate_borrower_name>1</duplicate_borrower_name>        
        <duplicate_loan_number>1</duplicate_loan_number>        
        <duplicate_property_address>1</duplicate_property_address>        
        <ignore_invalid_address>0</ignore_invalid_address>    
    </application_file>    
    <order_source_value>lenderx_appraisal_order</order_source_value>    
    <comments>${instruction}</comments>    
    <forms>
        ${formsXML}
    </forms>
    <borrower_email>${borrower_email}</borrower_email>    
    <borrower_enters_payment_info>false</borrower_enters_payment_info>    
    <lender_requested_delivery_date>${dueDate}</lender_requested_delivery_date>
    </request>`;
    const requestOptions = {

    method: "POST",

    headers: myHeaders,

    body: raw,

    redirect: "follow"

    };

    console.log("raww",raw);
 
    fetch("https://6zypur92ce.execute-api.us-east-1.amazonaws.com/LenderXTesting/create_order?lx_user=shubham@vidyatech.com&APIKey=E5DEsSvAAgKowf52BjJqAg&APISecret=mupojP8O3yCkQX3mWv2nlA&BaseURL=https://app.sandbox1.lenderx-labs.com", requestOptions)
      .then((response) => response.json())
      .then((result) => console.log(result))
      .catch((error) => console.error(error));

    }

// Acknowledgement sending to Epc with order status and id, which we get after creating a order in LenderX
async  function sendAcknowledgement(url,Transacdata,data)
{
    let appraisalStatusValue, order_id;
    (data).find('data').each(function(){
        appraisalStatusValue=$(this).find('appraisal_order_value').text();
        order_id=$(this).find('appraisal_order_id').text();
    });
    console.log("hbdhdhu",appraisalStatusValue,order_id);

    const raw = JSON.stringify({

    "partnerStatus": await status(appraisalStatusValue),
    "status":"processing",
    "referenceNumber":order_id,
    "respondingParty ": {
        "name": Transacdata.request.requestingParty.name,
        "address": Transacdata.request.requestingParty.address,
        "city": Transacdata.request.requestingParty.city,
        "state":Transacdata.request.requestingParty.state,
        "postalCode": Transacdata.request.requestingParty.postalCode,
        "pointOfContact": {
        "name": Transacdata.request.requestingParty.pointOfContact.name,
        "phone":Transacdata.request.requestingParty.pointOfContact.phone,
        "email": Transacdata.request.requestingParty.pointOfContact.email
        }
     }
    });
 
    const requestOptions = {
    method: "PATCH",
    headers:{
        'Access-Control-Allow-Origin':'*',
        'Authorization': `Bearer ${Token}`,
        'Content-Type':"application/json"
    },
    body: raw,
    redirect: "follow"
    };
   
    fetch(`${url}/response`, requestOptions)
    .then((response) => response.text())
    .then((result) => console.log(result))
    .catch((error) => console.error(error));
}

// Status Mapping
async function status(status) {
    switch (status) {
        case "assignment_ready":
            return "Assignment Ready";
        case "pending":
            return "Pending";
        case "assigned":
            return "Assigned";
        case "accepted_with_conditions":
            return "Accepted With Conditions";
        case "in_progress":
            return "In Progress";
        case "review_ready":
            return "Review Ready";
        case "in_review":
            return "In Review";
        case "rework_required":
            return "Rework Required";
        case "hold":
            return "Hold";
        case "complete":
            return "Complete";
        case "cancelled":
            return "Cancelled";
        default:
            let i = 0;
            let modifiedStatus = '';
            for (let c of status || '') {
                if (i === 0 && /[a-zA-Z]/.test(c)) {
                    c = c.toUpperCase();
                    i = -1;
                }
                if (c === '_') {
                    c = ' ';
                    i = 0;
                }
                modifiedStatus += c;
            }
            return modifiedStatus;
    }
}
