

TechnitiumLibrary.Net Project

1. Edit the Dns/DnsResourceRecords.cs file

1.1 Add Resource Record mnemonic (XXXYYY) to DnsResourceRecordType enum: 

XXXYYY,

NOTE:	Choose the integer value for the mnemoic from the following range:

65280-65534		0xFF00-0xFFFE	Reserved for Private Use

Reference: https://www.iana.org/assignments/dns-parameters/dns-parameters.xhtml#dns-parameters-4

1.1 Add select case in DnsResourceRecord(Stream s)

                case DnsResourceRecordType.DIDATHN: // mwh
                    _data = new DnsDIDATHNRecord(s);
                    break;

1.2 Add select case in DnsResourceRecord(dynamic jsonResourceRecord)

                case DnsResourceRecordType.DIDATHN: // mwh
                    _data = new DnsDIDATHNRecord(jsonResourceRecord);
                    break;

2. Create Dns/ResourceRecords/DnsXxxYyyRecord.cs using copy and paste of an existing ResourceRecords/*.cs source file

2.1 Update properties


DnsServerCore Project

3. Edit www/index.html

3.1 Add Resource Record mnemonic (XXXYYY) to optDnsClientType select element: 
<option>XXXYYY</option>

3.2 Add Resource Record mnemonic (XXXYYY) to optAddEditRecordType select element: 
<option>XXXYYY</option>

274                    case "DIDATHN": // mwh
                        tableHtmlRows += "<td><b>Public Key DID:</b> " + htmlEncode(records[i].attributes.didDID) +
                            "<br /><b>Type:</b> " + htmlEncode(records[i].attributes.didType) +
                            "<br /><b>Public Key:</b> " + htmlEncode(records[i].attributes.value) +
                            "<br /><b>Controller DID:</b> " + htmlEncode(records[i].attributes.didControllerDID) + "</td>";

                        additionalDataAttributes = "data-record-didDID=\"" + htmlEncode(records[i].attributes.didDID) + "\" " +
                            "data-record-didType=\"" + htmlEncode(records[i].attributes.didType) + "\" " +
                            "data-record-didControllerDID=\"" + htmlEncode(records[i].attributes.didControllerDID) + "\" ";
                        break;

559        case "DIDATHN": // mwh
            $("#lblAddEditRecordNameOrSubjectDID").text("Subject DID");
            $("#divAddEditRecordNameOrSubjectDID").show();
            $("#lblAddEditRecordDIDValue").text("Subject Authentication DID");
            $("#txtAddEditRecordDIDValue").val("");
            $("#divAddEditRecordDID").show();
            $("#lblAddEditRecordTypeValue").text("Type");
            $("#txtAddEditRecordTypeValue").val("");
            $("#divAddEditRecordType").show();
            $("#lblAddEditRecordPublicKeyValue").text("Public Key (Base58)");
            $("#txtAddEditRecordPublicKeyValue").val("");
            $("#divAddEditRecordPublicKey").show();
            $("#lblAddEditRecordControllerDIDValue").text("Controller DID");
            $("#txtAddEditRecordControllerDIDValue").val("");
            $("#divAddEditRecordControllerDID").show();
            break;

790        case "DIDATHN": // mwh
            if ($("#txtAddEditRecordNameOrSubjectDID").val() === "") {
                showAlert("warning", "Missing!", "Please enter a Subject DID.", divAddEditRecordAlert);
                $("#txtAddEditRecordNameOrSubjectDID").focus();
                return;
            }

            var did = $("#txtAddEditRecordDIDValue").val();
            if (did === "") {
                showAlert("warning", "Missing!", "Please enter a suitable Authentication Key DID.", divAddEditRecordAlert);
                $("#txtAddEditRecordDIDValue").focus();
                return;
            }

            var type = $("#txtAddEditRecordTypeValue").val();
            if (type === "") {
                showAlert("warning", "Missing!", "Please enter a suitable Type.", divAddEditRecordAlert);
                $("#txtAddEditRecordTypeValue").focus();
                return;
            }

            var controller = $("#txtAddEditRecordControllerDIDValue").val();
            if (controller === "") {
                showAlert("warning", "Missing!", "Please enter a suitable Controller DID.", divAddEditRecordAlert);
                $("#txtAddEditRecordControllerDIDValue").focus();
                return;
            }

            var publicKey = $("#txtAddEditRecordPublicKeyValue").val();
            if (publicKey === "") {
                showAlert("warning", "Missing!", "Please enter a suitable value into the Public Key field.", divAddEditRecordAlert);
                $("#txtAddEditRecordPublicKeyValue").focus();
                return;
            }

            apiUrl += "&didDID=" + did + "&didType=" + type + "&didControllerDID=" + controller + "&value=" + encodeURIComponent(publicKey) + "&didTrace=" + "zone.js:addRecord";
            break;

1004         case "DIDATHN": // mwh
            $("#txtAddEditRecordDIDValue").val(divData.attr("data-record-didDID"));
            $("#txtAddEditRecordTypeValue").val(divData.attr("data-record-didType"));
            $("#txtAddEditRecordPublicKeyValue").val(divData.attr("data-record-value"));
            $("#txtAddEditRecordControllerDIDValue").val(divData.attr("data-record-didControllerDID"));
            break;

1214        case "DIDATHN": // mwh
            if ($("#txtAddEditRecordNameOrSubjectDID").val() === "") {
                showAlert("warning", "Missing!", "Please enter a name that includes service and protocol labels.", divAddEditRecordAlert);
                $("#txtAddEditRecordNameOrSubjectDID").focus();
                return;
            }

            var oldDID = divData.attr("data-record-didDID");
            var oldType = divData.attr("data-record-didType");
            var oldControllerDID = divData.attr("data-record-didControllerDID");
            var oldValue = divData.attr("data-record-value");

            var newDID = $("#txtAddEditRecordDIDValue").val();
            if (newDID === "") {
                showAlert("warning", "Missing!", "Please enter a suitable SVC DID.", divAddEditRecordAlert);
                $("#txtAddEditRecordDIDValue").focus();
                return;
            }

            var newType = $("#txtAddEditRecordTypeValue").val();
            if (newType === "") {
                showAlert("warning", "Missing!", "Please enter a suitable Type.", divAddEditRecordAlert);
                $("#txtAddEditRecordTypeValue").focus();
                return;
            }

            var newControllerDID = $("#txtAddEditRecordControllerDIDValue").val();
            if (newControllerDID === "") {
                showAlert("warning", "Missing!", "Please enter a suitable Controller DID.", divAddEditRecordAlert);
                $("#txtAddEditRecordControllerDIDValue").focus();
                return;
            }

            var newValue = $("#txtAddEditRecordPublicKeyValue").val();
            if (newValue === "") {
                showAlert("warning", "Missing!", "Please enter a suitable value into the Public Key field.", divAddEditRecordAlert);
                $("#txtAddEditRecordPublicKeyValue").focus();
                return;
            }

            apiUrl += "&oldDID=" + oldDID + "&oldType=" + oldType + "&oldControllerDID=" + oldControllerDID + "&oldValue=" + oldValue
                + "&newDID=" + newDID + "&newType=" + newType + "&newControllerDID=" + newControllerDID + "&newValue=" + newValue
                + "&didTrace=" + "zone.js:updateRecord";
            break;




