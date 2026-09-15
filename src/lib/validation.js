/* ============================================================
   Form 8038-CP — Frontend Validation
   Mirrors IRS 2027v1.0 XSD schema and backend Java validation
   ============================================================ */

/* ---- Helpers ---- */

export function stripNonDigits(str) {
  return String(str || '').replace(/\D/g, '');
}

export function isBlank(val) {
  return val === null || val === undefined || String(val).trim() === '';
}

export function isValidDate(str) {
  if (!str || typeof str !== 'string') return false;
  // Expect YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
  const d = new Date(str + 'T00:00:00');
  if (isNaN(d.getTime())) return false;
  // Verify round-trip (guards against Feb 30, etc.)
  const [y, m, day] = str.split('-').map(Number);
  return d.getFullYear() === y && (d.getMonth() + 1) === m && d.getDate() === day;
}

export function parseDate(str) {
  if (!isValidDate(str)) return null;
  return new Date(str + 'T00:00:00');
}

function parseDollar(str) {
  if (isBlank(str)) return NaN;
  return parseFloat(String(str).replace(/,/g, ''));
}

/* ---- Step 1 — Part I ---- */

export function validateStep1(fd) {
  const errors = {};

  // line1 — BusinessName: REQUIRED, max 75 chars
  if (isBlank(fd.line1)) {
    errors.line1 = 'Entity name is required.';
  } else if (fd.line1.trim().length > 75) {
    errors.line1 = 'Entity name must be 75 characters or fewer.';
  }

  // line2 — EIN: REQUIRED, strip hyphens → exactly 9 digits
  const ein2 = stripNonDigits(fd.line2);
  if (isBlank(fd.line2)) {
    errors.line2 = 'EIN is required.';
  } else if (ein2.length !== 9) {
    errors.line2 = 'EIN must be exactly 9 digits (e.g. 12-3456789).';
  }

  // line3_street — StreetAddressType: REQUIRED, max 35 chars
  if (isBlank(fd.line3_street)) {
    errors.line3_street = 'Street address is required.';
  } else if (fd.line3_street.trim().length > 35) {
    errors.line3_street = 'Street address must be 35 characters or fewer.';
  }

  // line3_room — optional, max 10 chars
  if (!isBlank(fd.line3_room) && fd.line3_room.trim().length > 10) {
    errors.line3_room = 'Room/Suite must be 10 characters or fewer.';
  }

  // line4 — City / State / ZIP (split fields)
  if (isBlank(fd.line4_city)) {
    errors.line4_city = 'City is required.';
  } else if (fd.line4_city.trim().length > 40) {
    errors.line4_city = 'City must be 40 characters or fewer.';
  }
  if (isBlank(fd.line4_state)) {
    errors.line4_state = 'State is required.';
  }
  if (isBlank(fd.line4_zip)) {
    errors.line4_zip = 'ZIP code is required.';
  } else {
    const zipDigits = stripNonDigits(fd.line4_zip);
    if (zipDigits.length !== 5 && zipDigits.length !== 9) {
      errors.line4_zip = 'ZIP code must be 5 digits or ZIP+4 (9 digits).';
    }
  }

  // line5 — Name + Title (split fields); combined must be ≤ 35 chars
  if (isBlank(fd.line5_name)) {
    errors.line5_name = 'Contact person name is required.';
  } else {
    const combined5 = [fd.line5_name, fd.line5_title].map(s => (s || '').trim()).filter(Boolean).join(' ');
    if (combined5.length > 35) {
      errors.line5_name = 'Name and title combined must be 35 characters or fewer.';
    }
  }

  // line6 — PhoneNumberType: REQUIRED, strip non-digits → exactly 10 digits
  const phone6 = stripNonDigits(fd.line6);
  if (isBlank(fd.line6)) {
    errors.line6 = 'Telephone number is required.';
  } else if (phone6.length !== 10) {
    errors.line6 = 'Telephone number must be exactly 10 digits.';
  }

  return errors;
}

/* ---- Step 2 — Part II ---- */

export function validateStep2(fd) {
  const errors = {};

  const isSame = String(fd.line7 || '').trim().toUpperCase() === 'SAME';

  // line8 — Issuer EIN (only if NOT SAME and a value is provided)
  if (!isSame && !isBlank(fd.line8)) {
    const ein8 = stripNonDigits(fd.line8);
    if (ein8.length !== 9) {
      errors.line8 = 'Issuer EIN must be exactly 9 digits.';
    }
  }

  // line10 — ReportNum: REQUIRED, must match /^[248][0-9][0-9]$/
  if (isBlank(fd.line10)) {
    errors.line10 = 'Report number is required.';
  } else if (!/^[248][0-9][0-9]$/.test(fd.line10.trim())) {
    errors.line10 = 'Report number must be 3 digits starting with 2, 4, or 8 (e.g. 248, 401).';
  }

  // line12 — BondIssueDt: REQUIRED, valid YYYY-MM-DD, between 2009-02-17 and 2017-12-31
  if (isBlank(fd.line12)) {
    errors.line12 = 'Date of issue is required.';
  } else if (!isValidDate(fd.line12)) {
    errors.line12 = 'Date of issue must be a valid date (YYYY-MM-DD).';
  } else {
    const d = parseDate(fd.line12);
    const min = parseDate('2009-02-17');
    const max = parseDate('2017-12-31');
    if (d < min || d > max) {
      errors.line12 = 'Date of issue must be between 2009-02-17 and 2017-12-31.';
    }
  }

  // line13 — BondIssueNm: REQUIRED, max 35 chars
  if (isBlank(fd.line13)) {
    errors.line13 = 'Name of issue is required.';
  } else if (fd.line13.trim().length > 35) {
    errors.line13 = 'Name of issue must be 35 characters or fewer.';
  }

  // line14 — CUSIP or "NONE": REQUIRED (checkbox sets it to "NONE" automatically)
  if (fd.line14_is_none) {
    // checkbox selected — treated as "NONE", always valid
  } else if (isBlank(fd.line14)) {
    errors.line14 = 'CUSIP number is required, or check "Check if NONE".';
  } else if (!/^[A-Za-z0-9]{9}$/.test(fd.line14.trim())) {
    errors.line14 = 'CUSIP must be exactly 9 alphanumeric characters.';
  }

  // line15 — ContactPersonNm: REQUIRED if NOT SAME; combined name+title ≤ 35 chars
  if (!isSame) {
    if (isBlank(fd.line15_name)) {
      errors.line15_name = 'IRS contact name is required when issuer is not "SAME".';
    } else {
      const combined15 = [fd.line15_name, fd.line15_title].map(s => (s || '').trim()).filter(Boolean).join(' ');
      if (combined15.length > 35) {
        errors.line15_name = 'Name and title combined must be 35 characters or fewer.';
      }
    }
  }

  // line16 — Phone: REQUIRED if NOT SAME, strip non-digits → exactly 10 digits
  if (!isSame) {
    const phone16 = stripNonDigits(fd.line16);
    if (isBlank(fd.line16)) {
      errors.line16 = 'IRS contact telephone is required when issuer is not "SAME".';
    } else if (phone16.length !== 10) {
      errors.line16 = 'IRS contact telephone must be exactly 10 digits.';
    }
  }

  // line17a — bond rate type: REQUIRED, "VARIABLE" or "FIXED"
  if (isBlank(fd.line17a)) {
    errors.line17a = 'Bond interest rate type is required (Variable or Fixed).';
  } else if (fd.line17a !== 'VARIABLE' && fd.line17a !== 'FIXED') {
    errors.line17a = 'Bond interest rate type must be "VARIABLE" or "FIXED".';
  }

  // line17b — IssuePriceAmt: optional; if provided must be positive number ≤ 9999999999999.99
  if (!isBlank(fd.line17b)) {
    const amt = parseDollar(fd.line17b);
    if (isNaN(amt) || amt <= 0) {
      errors.line17b = 'Issue price must be a positive number.';
    } else if (amt > 9999999999999.99) {
      errors.line17b = 'Issue price exceeds the maximum allowed value.';
    }
  }

  // line17c — BondTypeCd: REQUIRED, one of the valid codes
  const VALID_BOND_TYPES = ['102', '103', '104', '105', '109', '110'];
  if (isBlank(fd.line17c)) {
    errors.line17c = 'Bond type code is required.';
  } else if (!VALID_BOND_TYPES.includes(fd.line17c)) {
    errors.line17c = 'Bond type code must be one of: 102, 103, 104, 105, 109, 110.';
  }

  return errors;
}

/* ---- Step 3 — Part III ---- */

export function validateStep3(fd) {
  const errors = {};

  const bondType = fd.line17c || '';
  const specifiedCreditBonds = ['102', '103', '104', '105'];
  const isSpecifiedCredit = specifiedCreditBonds.includes(bondType);

  // line18 — InterestPaymentDt: REQUIRED, valid date, >= 2009-02-17
  if (isBlank(fd.line18)) {
    errors.line18 = 'Interest payment date is required.';
  } else if (!isValidDate(fd.line18)) {
    errors.line18 = 'Interest payment date must be a valid date (YYYY-MM-DD).';
  } else {
    const d = parseDate(fd.line18);
    const min = parseDate('2009-02-17');
    if (d < min) {
      errors.line18 = 'Interest payment date must be on or after 2009-02-17.';
    }
  }

  // line19a — InterestPayableAmt: REQUIRED, must be > 0
  if (isBlank(fd.line19a)) {
    errors.line19a = 'Interest payable amount is required.';
  } else {
    const v19a = parseDollar(fd.line19a);
    if (isNaN(v19a) || v19a <= 0) {
      errors.line19a = 'Interest payable amount must be a positive number greater than 0.';
    }
  }

  // line19b — credit rate: REQUIRED if specifiedCredit bond type
  if (isSpecifiedCredit) {
    if (isBlank(fd.line19b)) {
      errors.line19b = 'Applicable credit rate is required for this bond type.';
    } else if (!/^([0-9]|[1-9][0-9])\.[0-9]{2}$/.test(fd.line19b.trim())) {
      errors.line19b = 'Credit rate must be in format ##.## (e.g. 5.25 or 12.50).';
    }
  }

  // Schedule A rows — REQUIRED if specifiedCredit bond type; line19c is auto-computed from rows
  if (isSpecifiedCredit) {
    const rows = fd.scheduleARows || [];
    const hasValidRow = rows.some(r =>
      !isBlank(r.colAMaturityDate) && !isBlank(r.colBActualInterest) && !isBlank(r.colCCreditRateInterest)
    );
    if (!hasValidRow) {
      errors.scheduleA = 'At least one complete Schedule A row (maturity date + both interest amounts) is required for this bond type.';
    }
  }

  // line21a and line21b — MUTUALLY EXCLUSIVE
  const has21a = !isBlank(fd.line21a);
  const has21b = !isBlank(fd.line21b);

  if (has21a && has21b) {
    errors.line21a = 'Only one of line 21a or 21b may be entered — not both.';
    errors.line21b = 'Only one of line 21a or 21b may be entered — not both.';
  } else {
    if (has21a) {
      const v21a = parseDollar(fd.line21a);
      if (isNaN(v21a) || v21a <= 0) {
        errors.line21a = 'Net increase amount must be a positive number.';
      }
      if (isBlank(fd.line21c_code)) {
        errors.line21c_code = 'Explanation code is required when line 21a is entered.';
      }
    }
    if (has21b) {
      const v21b = parseDollar(fd.line21b);
      if (isNaN(v21b) || v21b < 0) {
        errors.line21b = 'Net decrease amount must be 0 or a positive number.';
      }
      if (isBlank(fd.line21c_code)) {
        errors.line21c_code = 'Explanation code is required when line 21b is entered.';
      }
    }
  }

  // line23a — REQUIRED (yes/true or no/false)
  if (isBlank(fd.line23a)) {
    errors.line23a = 'Please answer Yes or No for line 23a.';
  }

  // line23b — REQUIRED if line23a is yes/true
  if (fd.line23a === 'true' || fd.line23a === 'yes') {
    if (isBlank(fd.line23b)) {
      errors.line23b = 'Explanation code 23b is required when 23a is Yes.';
    } else if (!/^23[1-9]$/.test(fd.line23b.trim())) {
      errors.line23b = 'Explanation code must be 231–239.';
    }
  }

  // line24a — REQUIRED (yes/true or no/false)
  if (isBlank(fd.line24a)) {
    errors.line24a = 'Please answer Yes or No for line 24a.';
  }

  // line24b — REQUIRED if line24a is no/false
  if (fd.line24a === 'false' || fd.line24a === 'no') {
    if (isBlank(fd.line24b)) {
      errors.line24b = 'Explanation code 24b is required when 24a is No.';
    }
  }

  // line25 — REQUIRED (yes/true or no/false)
  if (isBlank(fd.line25)) {
    errors.line25 = 'Please answer Yes or No for line 25.';
  }

  return errors;
}

/* ---- Step 4 — Direct Deposit + Signature + Paid Preparer ---- */

export function validateStep4(fd) {
  const errors = {};

  /* ---- Direct Deposit — all-or-nothing ---- */

  const routing = fd.routing || Array(9).fill('');
  const routingStr = routing.join('');
  const hasAnyRoutingDigit = routing.some(d => d !== '' && d !== null && d !== undefined);
  const accountTypeSet = !isBlank(fd.accountType);
  const accountNumberSet = !isBlank(fd.accountNumber);
  const anyDepositField = hasAnyRoutingDigit || accountTypeSet || accountNumberSet;

  if (anyDepositField) {
    const routingFilled = routing.filter(d => d !== '' && d !== null && d !== undefined).length;
    if (routingFilled !== 9) {
      errors.routing = 'All 9 routing number digits are required.';
    } else {
      const prefix = parseInt(routingStr.slice(0, 2), 10);
      const validPrefix = (prefix >= 1 && prefix <= 12) || (prefix >= 21 && prefix <= 32);
      if (!validPrefix) {
        errors.routing = 'Invalid ABA routing number — first two digits must be 01–12 or 21–32.';
      }
    }

    if (!accountTypeSet) {
      errors.accountType = 'Account type is required for direct deposit.';
    } else if (fd.accountType !== 'checking' && fd.accountType !== 'savings') {
      errors.accountType = 'Account type must be "checking" or "savings".';
    }

    if (!accountNumberSet) {
      errors.accountNumber = 'Account number is required for direct deposit.';
    } else if (!/^[A-Za-z0-9\-]{1,17}$/.test(fd.accountNumber)) {
      errors.accountNumber = 'Account number must be 1–17 alphanumeric characters or hyphens.';
    }
  }

  /* ---- Signature ---- */

  if (isBlank(fd.sig_signature)) {
    errors.sig_signature = 'Signature is required.';
  } else if (fd.sig_signature.trim().length > 35) {
    errors.sig_signature = 'Signature must be 35 characters or fewer.';
  }

  if (isBlank(fd.sig_date)) {
    errors.sig_date = 'Signature date is required.';
  } else if (!isValidDate(fd.sig_date)) {
    errors.sig_date = 'Signature date must be a valid date (YYYY-MM-DD).';
  }

  /* ---- Paid Preparer (optional, validate if provided) ---- */

  if (!isBlank(fd.prep_ptin)) {
    const ptinRaw = String(fd.prep_ptin).replace(/-/g, '').trim().toUpperCase();
    if (!/^P[0-9]{8}$/.test(ptinRaw)) {
      errors.prep_ptin = 'PTIN must be in format P-XXXXXXXX (P followed by 8 digits).';
    }
  }

  if (!isBlank(fd.prep_firm_ein)) {
    const firmEin = stripNonDigits(fd.prep_firm_ein);
    if (firmEin.length !== 9) {
      errors.prep_firm_ein = "Firm's EIN must be exactly 9 digits.";
    }
  }

  if (!isBlank(fd.prep_phone)) {
    const prepPhone = stripNonDigits(fd.prep_phone);
    if (prepPhone.length !== 10) {
      errors.prep_phone = 'Preparer phone number must be exactly 10 digits.';
    }
  }

  return errors;
}
