function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var data = JSON.parse(e.postData.contents);
  var action = data.action;
  
  if (action === 'register') {
    return registerUser(ss, data);
  } else if (action === 'login') {
    return loginUser(ss, data);
  } else if (action === 'searchMember') {
    return searchMember(ss, data);
  } else if (action === 'addMember') {
    return addMember(ss, data);
  } else if (action === 'incrementAttendance') {
    return incrementAttendance(ss, data);
  } else if (action === 'updateAttendance') {
    return updateAttendance(ss, data);
  } else if (action === 'createCoupon') {
    return createCoupon(ss, data);
  } else if (action === 'getCoupons') {
    return getCoupons(ss);
  } else if (action === 'searchCoupon') {
    return searchCoupon(ss, data);
  } else if (action === 'deleteCoupon') {
    return deleteCoupon(ss, data);
  } else if (action === 'extendCouponValidity') {
    return extendCouponValidity(ss, data);
  } else if (action === 'getMemberAttendance') {
    return getMemberAttendance(ss, data);
  } else if (action === 'getUsers') {
    return getUsers(ss);
  }
  
  return errorResponse('Invalid action');
}

function registerUser(ss, data) {
  var sheet = ss.getSheetByName('Users');
  if (!sheet) return errorResponse('Users sheet not found');
  
  var name = data.name;
  var email = data.email;
  var password = data.password;
  
  var users = sheet.getDataRange().getValues();
  for (var i = 1; i < users.length; i++) {
    if (users[i][2] === email) {
      return errorResponse('Email already exists');
    }
  }
  
  var id = Utilities.getUuid();
  var timestamp = new Date().toISOString();
  sheet.appendRow([id, name, email, password, timestamp]);
  
  return successResponse('User registered successfully');
}

function loginUser(ss, data) {
  var email = data.email;
  var password = data.password;
  
  if (email === 'admin@profit.com' && password === 'admin123') {
     return ContentService.createTextOutput(JSON.stringify({ 'result': 'success', 'message': 'Admin login', 'isAdmin': true })).setMimeType(ContentService.MimeType.JSON);
  }
  
  var sheet = ss.getSheetByName('Users');
  if (!sheet) return errorResponse('Users sheet not found');
  
  var users = sheet.getDataRange().getValues();
  for (var i = 1; i < users.length; i++) {
    if (users[i][2] === email && users[i][3] === password) {
      return ContentService.createTextOutput(JSON.stringify({ 'result': 'success', 'message': 'Login successful', 'user': users[i][1], 'isAdmin': false, 'email': email })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return errorResponse('Invalid email or password');
}

function getUsers(ss) {
  var sheet = ss.getSheetByName('Users');
  if (!sheet) return errorResponse('Users sheet not found');
  
  var rows = sheet.getDataRange().getValues();
  var users = [];
  
  for (var i = 1; i < rows.length; i++) {
    users.push({
      id: rows[i][0],
      name: rows[i][1],
      email: rows[i][2]
    });
  }
  
  return ContentService.createTextOutput(JSON.stringify({ 'result': 'success', 'users': users })).setMimeType(ContentService.MimeType.JSON);
}

function searchMember(ss, data) {
  var sheet = ss.getSheetByName('Members');
  if (!sheet) return errorResponse('Members sheet not found');
  
  var query = data.query.toLowerCase();
  var users = sheet.getDataRange().getValues();
  var results = [];
  
  for (var i = 1; i < users.length; i++) {
    var name = String(users[i][1]).toLowerCase();
    var email = String(users[i][2]).toLowerCase();
    
    if (name.includes(query) || email.includes(query)) {
      results.push({
        id: users[i][0],
        name: users[i][1],
        email: users[i][2],
        age: users[i][3],
        weight: users[i][4],
        height: users[i][5],
        plan: users[i][6],
        attendance: users[i][7],
        created_at: users[i][8]
      });
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({ 'result': 'success', 'members': results })).setMimeType(ContentService.MimeType.JSON);
}

function addMember(ss, data) {
  var sheet = ss.getSheetByName('Members');
  if (!sheet) return errorResponse('Members sheet not found');
  
  var id = Utilities.getUuid();
  var timestamp = new Date().toISOString();
  sheet.appendRow([id, data.name, data.email, data.age, data.weight, data.height, data.plan, 0, timestamp]);
  
  return successResponse('Member added successfully');
}

function incrementAttendance(ss, data) {
  var sheet = ss.getSheetByName('Members');
  if (!sheet) return errorResponse('Members sheet not found');
  
  var id = data.id;
  var users = sheet.getDataRange().getValues();
  
  for (var i = 1; i < users.length; i++) {
    if (users[i][0] === id) {
      var currentAttendance = users[i][7];
      var dates = [];
      
      // Handle legacy integer data or parse JSON
      if (typeof currentAttendance === 'number') {
        dates = []; // Reset legacy count as we can't map it to dates
      } else {
        try {
          dates = JSON.parse(currentAttendance);
        } catch (e) {
          dates = [];
        }
      }
      
      var today = new Date().toISOString().split('T')[0];
      if (!dates.includes(today)) {
        dates.push(today);
        sheet.getRange(i + 1, 8).setValue(JSON.stringify(dates));
      }
      
      return ContentService.createTextOutput(JSON.stringify({ 'result': 'success', 'newAttendance': dates.length })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return errorResponse('Member not found');
}

function updateAttendance(ss, data) {
  var sheet = ss.getSheetByName('Members');
  if (!sheet) return errorResponse('Members sheet not found');
  
  var email = data.email;
  var date = data.date; // YYYY-MM-DD
  var status = data.status; // 'present' or 'absent'
  
  var users = sheet.getDataRange().getValues();
  
  for (var i = 1; i < users.length; i++) {
    if (String(users[i][2]).toLowerCase() === String(email).toLowerCase()) {
      var currentAttendance = users[i][7];
      var dates = [];
      
      try {
        dates = JSON.parse(currentAttendance);
        if (!Array.isArray(dates)) dates = [];
      } catch (e) {
        dates = [];
      }
      
      if (status === 'present') {
        if (!dates.includes(date)) {
          dates.push(date);
        }
      } else {
        dates = dates.filter(d => d !== date);
      }
      
      sheet.getRange(i + 1, 8).setValue(JSON.stringify(dates));
      
      return successResponse('Attendance updated');
    }
  }
  
  return errorResponse('Member not found');
}

function getMemberAttendance(ss, data) {
  var membersSheet = ss.getSheetByName('Members');
  var email = data.email;
  
  if (membersSheet) {
    var members = membersSheet.getDataRange().getValues();
    for (var i = 1; i < members.length; i++) {
      if (String(members[i][2]).toLowerCase() === String(email).toLowerCase()) {
        var attendanceData = members[i][7];
        var dates = [];
        try {
          dates = JSON.parse(attendanceData);
          if (!Array.isArray(dates)) dates = [];
        } catch (e) {
          // If it's a number (legacy), we return empty list or handle it. 
          // For now, return empty list to enforce new system.
          dates = [];
        }
        return ContentService.createTextOutput(JSON.stringify({ 'result': 'success', 'attendance': dates })).setMimeType(ContentService.MimeType.JSON);
      }
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({ 'result': 'success', 'attendance': [] })).setMimeType(ContentService.MimeType.JSON);
}

function createCoupon(ss, data) {
  var sheet = ss.getSheetByName('Coupons');
  if (!sheet) return errorResponse('Coupons sheet not found');
  
  var id = Utilities.getUuid();
  var timestamp = new Date().toISOString();
  
  // 'id', 'code', 'name', 'description', 'valid_till', 'unlock_condition', 'target_user', 'created_at'
  sheet.appendRow([
    id,
    data.code,
    data.name,
    data.description,
    data.valid_till,
    data.unlock_condition,
    data.target_user,
    timestamp
  ]);
  
  return successResponse('Coupon created successfully');
}

function getCoupons(ss) {
  var sheet = ss.getSheetByName('Coupons');
  if (!sheet) return errorResponse('Coupons sheet not found');
  
  var rows = sheet.getDataRange().getValues();
  var coupons = [];
  
  // Skip header row
  for (var i = 1; i < rows.length; i++) {
    coupons.push({
      rowIndex: i, // Useful for deletion
      id: rows[i][0],
      code: rows[i][1],
      name: rows[i][2],
      description: rows[i][3],
      valid_till: rows[i][4],
      unlock_condition: rows[i][5],
      target_user: rows[i][6],
      created_at: rows[i][7]
    });
  }
  
  return ContentService.createTextOutput(JSON.stringify({ 'result': 'success', 'coupons': coupons })).setMimeType(ContentService.MimeType.JSON);
}

function deleteCoupon(ss, data) {
  var sheet = ss.getSheetByName('Coupons');
  if (!sheet) return errorResponse('Coupons sheet not found');
  
  var rowIndex = parseInt(data.rowIndex);
  
  // Validate rowIndex (simple check)
  if (isNaN(rowIndex) || rowIndex < 1 || rowIndex > sheet.getLastRow()) {
    return errorResponse('Invalid row index');
  }
  
  // +1 because sheet rows are 1-indexed and we might have passed 0-based index if not careful, 
  // but getCoupons returned 'i' which is 0-based index relative to data array but 1-based relative to sheet if we started loop at 1.
  // Wait, in getCoupons: for (var i = 1; i < rows.length; i++) -> rowIndex = i.
  // sheet.deleteRow(rowPosition). rowPosition is 1-based.
  // If i=1 (first data row), sheet row is 2 (header is 1).
  // Actually sheet.getDataRange().getValues() returns array where index 0 is row 1.
  // So index i corresponds to row i+1.
  
  sheet.deleteRow(rowIndex + 1);
  
  return successResponse('Coupon deleted successfully');
}

function setupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  var usersSheet = ss.getSheetByName('Users');
  if (!usersSheet) {
    usersSheet = ss.insertSheet('Users');
    usersSheet.appendRow(['id', 'name', 'email', 'password', 'created_at']);
  }
  
  var membersSheet = ss.getSheetByName('Members');
  if (!membersSheet) {
    membersSheet = ss.insertSheet('Members');
    membersSheet.appendRow(['id', 'name', 'email', 'age', 'weight', 'height', 'plan', 'attendance', 'created_at']);
  }
  
  var couponsSheet = ss.getSheetByName('Coupons');
  if (!couponsSheet) {
    couponsSheet = ss.insertSheet('Coupons');
    couponsSheet.appendRow(['id', 'code', 'name', 'description', 'valid_till', 'unlock_condition', 'target_user', 'created_at']);
  }
}

function errorResponse(message) {
  return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'message': message })).setMimeType(ContentService.MimeType.JSON);
}

function successResponse(message) {
  return ContentService.createTextOutput(JSON.stringify({ 'result': 'success', 'message': message })).setMimeType(ContentService.MimeType.JSON);
}
