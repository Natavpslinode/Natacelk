Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        const { action, username, password } = await req.json();

        if (action === 'login') {
            // Hardcoded admin credentials
            const ADMIN_USERNAME = 'admin';
            const ADMIN_PASSWORD = 'meproc2024';

            if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
                // Successful admin login
                const adminData = {
                    id: 'admin-001',
                    username: 'admin',
                    full_name: 'Administrador MEPROC',
                    role: 'admin',
                    loginTime: new Date().toISOString()
                };

                return new Response(JSON.stringify({
                    data: {
                        success: true,
                        admin: adminData,
                        message: 'Login exitoso'
                    }
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            } else {
                // Invalid credentials
                return new Response(JSON.stringify({
                    data: {
                        success: false,
                        message: 'Credenciales incorrectas'
                    }
                }), {
                    status: 401,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }
        }

        // Invalid action
        return new Response(JSON.stringify({
            error: {
                code: 'INVALID_ACTION',
                message: 'Acción no válida'
            }
        }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Admin auth error:', error);

        const errorResponse = {
            error: {
                code: 'ADMIN_AUTH_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});