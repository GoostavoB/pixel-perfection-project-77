import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// NPPES NPI Registry API Configuration
const NPPES_API_BASE = "https://npiregistry.cms.hhs.gov/api/?version=2.1";

interface ProviderValidationRequest {
  npi?: string;
  providerName?: string;
  organizationName?: string;
  city?: string;
  state?: string;
}

interface NPPESProvider {
  number: string;
  enumeration_type: string;
  basic: {
    first_name?: string;
    last_name?: string;
    organization_name?: string;
    credential?: string;
    sole_proprietor?: string;
    gender?: string;
    enumeration_date?: string;
    last_updated?: string;
    status?: string;
    name_prefix?: string;
  };
  taxonomies: Array<{
    code: string;
    desc: string;
    primary: boolean;
    state?: string;
    license?: string;
  }>;
  addresses: Array<{
    country_code: string;
    country_name: string;
    address_purpose: string;
    address_type: string;
    address_1: string;
    address_2?: string;
    city: string;
    state: string;
    postal_code: string;
    telephone_number: string;
    fax_number?: string;
  }>;
}

interface NPPESResponse {
  result_count: number;
  results: NPPESProvider[];
}

/**
 * Validate a provider using NPI number
 */
async function validateByNPI(npi: string): Promise<NPPESProvider | null> {
  try {
    const url = `${NPPES_API_BASE}&number=${npi}&pretty=true`;
    console.log('Searching NPPES by NPI:', npi);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`NPPES API returned ${response.status} for NPI ${npi}`);
      return null;
    }
    
    const data: NPPESResponse = await response.json();
    
    if (data.result_count > 0 && data.results.length > 0) {
      console.log(`Found provider: ${data.results[0].basic.organization_name || 
        `${data.results[0].basic.first_name} ${data.results[0].basic.last_name}`}`);
      return data.results[0];
    }
    
    console.log(`No provider found for NPI ${npi}`);
    return null;
  } catch (error) {
    console.error(`Error validating NPI ${npi}:`, error);
    return null;
  }
}

/**
 * Search providers by name and location
 */
async function searchProviders(params: ProviderValidationRequest): Promise<NPPESProvider[]> {
  try {
    const searchParams = new URLSearchParams();
    searchParams.append('version', '2.1');
    searchParams.append('pretty', 'true');
    searchParams.append('limit', '10');
    
    if (params.organizationName) {
      searchParams.append('organization_name', params.organizationName);
    }
    
    if (params.providerName) {
      const nameParts = params.providerName.split(' ');
      if (nameParts.length >= 2) {
        searchParams.append('first_name', nameParts[0]);
        searchParams.append('last_name', nameParts[nameParts.length - 1]);
      } else {
        searchParams.append('last_name', params.providerName);
      }
    }
    
    if (params.city) {
      searchParams.append('city', params.city);
    }
    
    if (params.state) {
      searchParams.append('state', params.state);
    }
    
    const url = `${NPPES_API_BASE}&${searchParams.toString()}`;
    console.log('Searching NPPES with params:', params);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error(`NPPES API search returned ${response.status}`);
      return [];
    }
    
    const data: NPPESResponse = await response.json();
    
    console.log(`Found ${data.result_count} providers matching criteria`);
    return data.results || [];
    
  } catch (error) {
    console.error('Error searching NPPES:', error);
    return [];
  }
}

/**
 * Extract relevant provider information
 */
function formatProviderInfo(provider: NPPESProvider) {
  const isOrg = provider.enumeration_type === 'NPI-2';
  
  // Get primary taxonomy
  const primaryTaxonomy = provider.taxonomies?.find(t => t.primary) || provider.taxonomies?.[0];
  
  // Get addresses
  const practiceAddress = provider.addresses?.find(a => a.address_purpose === 'LOCATION') || 
                         provider.addresses?.[0];
  const mailingAddress = provider.addresses?.find(a => a.address_purpose === 'MAILING');
  
  return {
    npi: provider.number,
    type: isOrg ? 'Organization' : 'Individual',
    name: isOrg ? provider.basic.organization_name : 
          `${provider.basic.first_name} ${provider.basic.last_name}`,
    credential: provider.basic.credential,
    status: provider.basic.status,
    enumeration_date: provider.basic.enumeration_date,
    last_updated: provider.basic.last_updated,
    specialty: primaryTaxonomy?.desc,
    taxonomy_code: primaryTaxonomy?.code,
    all_specialties: provider.taxonomies?.map(t => t.desc),
    practice_address: practiceAddress ? {
      street: practiceAddress.address_1,
      city: practiceAddress.city,
      state: practiceAddress.state,
      postal_code: practiceAddress.postal_code,
      phone: practiceAddress.telephone_number
    } : null,
    mailing_address: mailingAddress ? {
      street: mailingAddress.address_1,
      city: mailingAddress.city,
      state: mailingAddress.state,
      postal_code: mailingAddress.postal_code
    } : null
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const params: ProviderValidationRequest = await req.json();
    
    console.log('Provider validation request:', params);
    
    let provider: NPPESProvider | null = null;
    let searchResults: NPPESProvider[] = [];
    
    // First try NPI lookup if provided
    if (params.npi) {
      provider = await validateByNPI(params.npi);
      
      if (provider) {
        return new Response(
          JSON.stringify({
            success: true,
            found: true,
            provider: formatProviderInfo(provider),
            validation: {
              npi_valid: true,
              status_active: provider.basic.status === 'A',
              has_specialty: provider.taxonomies && provider.taxonomies.length > 0
            }
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }
    }
    
    // If NPI not found or not provided, try name/location search
    if (!provider && (params.providerName || params.organizationName)) {
      searchResults = await searchProviders(params);
      
      if (searchResults.length > 0) {
        return new Response(
          JSON.stringify({
            success: true,
            found: true,
            multiple: searchResults.length > 1,
            count: searchResults.length,
            providers: searchResults.map(p => formatProviderInfo(p)),
            message: searchResults.length > 1 ? 
              'Multiple providers found. Please verify which is correct.' :
              'Provider found'
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }
    }
    
    // No results found
    return new Response(
      JSON.stringify({
        success: true,
        found: false,
        message: 'No provider found matching the criteria',
        searched: params
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
    
  } catch (error) {
    console.error('Error in validate-provider:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
