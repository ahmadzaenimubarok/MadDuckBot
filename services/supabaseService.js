const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
} else {
  console.warn("⚠️ SUPABASE_URL or SUPABASE_KEY is missing. Database features will not work.");
}

async function saveTransaction(nominal, keterangan, username, date) {
  if (!supabase) {
    return { success: false, error: "Supabase client not initialized. Check .env file." };
  }

  // Use provided date or default to now
  const transactionDate = date ? new Date(date) : new Date();

  // Validate date
  if (isNaN(transactionDate.getTime())) {
    return { success: false, error: "Format tanggal tidak valid (gunakan YYYY-MM-DD)" };
  }

  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert([
        { 
          amount: nominal, 
          description: keterangan, 
          username: username,
          date: transactionDate.toISOString() 
        }
      ])
      .select();

    if (error) {
      console.error('Error inserting transaction:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data[0] };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: err.message };
  }
}

async function updateTransaction(id, updates) {
  if (!supabase) {
    return { success: false, error: "Supabase client not initialized." };
  }

  // Filter undefined values
  const payload = {};
  if (updates.nominal !== null) payload.amount = updates.nominal;
  if (updates.keterangan !== null) payload.description = updates.keterangan;
  if (updates.tanggal !== null) {
     const dateObj = new Date(updates.tanggal);
     if (!isNaN(dateObj.getTime())) {
       payload.date = dateObj.toISOString();
     }
  }

  try {
    const { data, error } = await supabase
      .from('transactions')
      .update(payload)
      .eq('id', id)
      .select();

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.length === 0) {
      return { success: false, error: "Transaksi tidak ditemukan." };
    }

    return { success: true, data: data[0] };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

module.exports = { saveTransaction, updateTransaction };
