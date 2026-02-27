// ==============================
// SUPABASE CONFIGURATION
// ==============================

// Supabase project config
const SUPABASE_URL =
    "https://lbgoiqdzlkodonzchjhu.supabase.co";

const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxiZ29pcWR6bGtvZG9uemNoamh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEzMzA2MzcsImV4cCI6MjA4NjkwNjYzN30.cjDexelIkc2wDZIKEUo78ykRlvNCLCCLjbOmmSUyVbY";

// ⚠️ Make sure this script exists in HTML BEFORE this file:
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>

// Check if library loaded
if (!window.supabase) {
    console.error("Supabase library not loaded.");
}

// Initialize client safely
const { createClient } = window.supabase;

window.supabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

console.log("Supabase initialized");

// ==============================
// ARCHIVE DATABASE METHODS
// ==============================

window.archiveDB = {

    // ==========================
    // FIGURES
    // ==========================
    async getFigures(category = "all") {
        try {
            let query = window.supabaseClient
                .from("figures")
                .select("*");

            if (category !== "all") {
                query = query.eq("category", category);
            }

            const { data, error } = await query;

            if (error) throw error;

            return data;
        } catch (err) {
            console.error("getFigures error:", err.message);
            return [];
        }
    },

    async getFigureDetail(id) {
        try {
            const { data, error } =
                await window.supabaseClient
                    .from("figures")
                    .select(`
            *,
            figure_sections (*),
            figure_timeline (*),
            figure_network (*),
            figure_references (*)
          `)
                    .eq("id", id)
                    .single();

            if (error) throw error;

            return data;
        } catch (err) {
            console.error("getFigureDetail error:", err.message);
            return null;
        }
    },

    // ==========================
    // CASES
    // ==========================
    async getCases(letter = null) {
        try {
            let query = window.supabaseClient
                .from("cases")
                .select("id, title, year, category");

            if (letter) {
                query = query.ilike("title", `${letter}%`);
            }

            const { data, error } = await query;

            if (error) throw error;

            return data;
        } catch (err) {
            console.error("getCases error:", err.message);
            return [];
        }
    },

    async getCaseDetail(id) {
        try {
            const { data, error } =
                await window.supabaseClient
                    .from("cases")
                    .select(`
            *,
            case_timeline (*),
            case_players (*),
            case_evidence (*),
            case_documents (*)
          `)
                    .eq("id", id)
                    .single();

            if (error) throw error;

            return data;
        } catch (err) {
            console.error("getCaseDetail error:", err.message);
            return null;
        }
    },

    // ==========================
    // ORGANIZATIONS
    // ==========================
    async getOrganizations() {
        try {
            const { data, error } =
                await window.supabaseClient
                    .from("organizations")
                    .select("*");

            if (error) throw error;

            return data;
        } catch (err) {
            console.error("getOrganizations error:", err.message);
            return [];
        }
    },

    // ==========================
    // OPERATIONS
    // ==========================
    async getOperations() {
        try {
            const { data, error } =
                await window.supabaseClient
                    .from("operations")
                    .select("*");

            if (error) throw error;

            return data;
        } catch (err) {
            console.error("getOperations error:", err.message);
            return [];
        }
    }
};

