/**
 * Debug API Route - Check environment variables
 * IMPORTANT: Remove this in production!
 */

import { NextResponse } from 'next/server';

export async function GET() {
  // Check if environment variables are accessible
  const envCheck = {
    hasApiKey: !!process.env.ARK_API_KEY,
    apiKeyPrefix: process.env.ARK_API_KEY 
      ? process.env.ARK_API_KEY.substring(0, 10) + '...' 
      : 'MISSING',
    apiBase: process.env.BYTEPLUS_API_BASE || 'not set (using default)',
    seedLlmModel: process.env.BYTEPLUS_SEED_LLM_MODEL || 'not set (using default)',
    seedreamModel: process.env.BYTEPLUS_SEEDREAM_MODEL || 'not set (using default)',
    seedanceModel: process.env.BYTEPLUS_SEEDANCE_MODEL || 'not set (using default)',
    nodeEnv: process.env.NODE_ENV,
    // Check next.config.js env mapping
    nextConfigEnv: {
      ARK_API_KEY: process.env.ARK_API_KEY ? 'present' : 'MISSING',
      BYTEPLUS_API_BASE: process.env.BYTEPLUS_API_BASE || 'not set',
    }
  };

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: envCheck,
    message: envCheck.hasApiKey 
      ? 'Environment variables are accessible' 
      : 'ERROR: ARK_API_KEY is missing! Check Netlify environment variables.'
  });
}
