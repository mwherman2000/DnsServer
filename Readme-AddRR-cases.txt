zone.js??
        case "DIDATHN": // mwh
            $("#lblAddEditRecordNameOrSubjectDID").text("Subject DID");
            $("#divAddEditRecordNameOrSubjectDID").show();
            $("#lblAddEditRecordDIDValue").text("Authentication Public Key DID");
            $("#txtAddEditRecordDIDValue").val("");
            $("#divAddEditRecordDID").show();
            $("#lblAddEditRecordTypeValue").text("Type");
            $("#txtAddEditRecordTypeValue").val("");
            $("#divAddEditRecordType").show();
            $("#lblAddEditRecordPublicKeyValue").text("Public Key (Base58)");
            $("#txtAddEditRecordPublicKeyValue").val("");
            $("#divAddEditRecordPublicKey").show();
            $("#lblAddEditRecordControllerValue").text("Controller");
            $("#txtAddEditRecordControllerValue").val("");
            $("#divAddEditRecordController").show();
            break;

	case "DIDTXT": // mwh
            $("#lblAddEditRecordNameOrSubjectDID").text("Subject DID");
            $("#divAddEditRecordNameOrSubjectDID").show();
            $("#lblAddEditRecordDIDValue").text("Text DID");
            $("#txtAddEditRecordDIDValue").val("");
            $("#divAddEditRecordDID").show();
            $("#lblAddEditRecordTagValue").text("Tag");
            $("#txtAddEditRecordTagValue").val("");
            $("#divAddEditRecordTag").show();
            $("#lblAddEditRecordDataValue").text("Text Data");
            $("#txtAddEditRecordDataValue").val("");
            $("#divAddEditRecordData").show();
            break;

        case "DIDSUBSIG": // mwh
            $("#lblAddEditRecordNameOrSubjectDID").text("Subject DID");
            $("#divAddEditRecordNameOrSubjectDID").show();
            $("#lblAddEditRecordDIDValue").text("Subject Signature DID");
            $("#txtAddEditRecordDIDValue").val("");
            $("#divAddEditRecordDID").show();
            $("#lblAddEditRecordTagValue").text("Tag");
            $("#txtAddEditRecordTagValue").val("");
            $("#divAddEditRecordTag").show();
            $("#lblAddEditRecordDataValue").text("Signature Data");
            $("#txtAddEditRecordDataValue").val("");
            $("#divAddEditRecordData").show();
            break;

        case "DIDEXTDAT":
            $("#lblAddEditRecordNameOrSubjectDID").text("Subject DID");
            $("#divAddEditRecordNameOrSubjectDID").show();
            $("#lblAddEditRecordDIDValue").text("External Data DID");
            $("#txtAddEditRecordDIDValue").val("");
            $("#divAddEditRecordDID").show();
            $("#lblAddEditRecordTagValue").text("Tag");
            $("#txtAddEditRecordTagValue").val("");
            $("#divAddEditRecordTag").show();
            $("#lblAddEditRecordTypeValue").text("Data Source Type");
            $("#txtAddEditRecordTypeValue").val("");
            $("#divAddEditRecordType").show();
            $("#lblAddEditRecordDescriptionValue").text("Data Source");
            $("#txtAddEditRecordDescripionValue").val("");
            $("#divAddEditRecordDescription").show();
            $("#lblAddEditRecordDataValue").text("Query");
            $("#txtAddEditRecordDataValue").val("");
            $("#divAddEditRecordData").show();
            $("#lblAddEditRecordParametersValue").text("Parameters");
            $("#txtAddEditRecordParametersValue").val("");
            $("#divAddEditRecordParameters").show();
            break;