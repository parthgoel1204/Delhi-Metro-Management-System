import db, { initializeDatabase } from './db';
import bcrypt from 'bcryptjs';

const stations = [
    { name: 'Rajiv Chowk', code: 'RJVK', line: 'Blue Line / Yellow Line' },
    { name: 'Kashmere Gate', code: 'KSMG', line: 'Red Line / Yellow Line / Violet Line' },
    { name: 'HUDA City Centre', code: 'HUDA', line: 'Yellow Line' },
    { name: 'Hauz Khas', code: 'HZKZ', line: 'Yellow Line / Magenta Line' },
    { name: 'Chandni Chowk', code: 'CCWK', line: 'Yellow Line' },
    { name: 'Dwarka Sector 21', code: 'DWS21', line: 'Blue Line' },
    { name: 'Botanical Garden', code: 'BTGD', line: 'Blue Line / Magenta Line' },
    { name: 'New Delhi', code: 'NDLS', line: 'Yellow Line / Airport Express' },
    { name: 'Mandi House', code: 'MDHS', line: 'Blue Line / Violet Line' },
    { name: 'Central Secretariat', code: 'CSRT', line: 'Yellow Line / Violet Line' },
];

async function seedData() {
    await initializeDatabase();

    const client = await db.connect();
    try {
        await client.query('BEGIN');

        // Insert stations
        for (const station of stations) {
            await client.query(
                'INSERT INTO stations (name, code, line) VALUES ($1, $2, $3) ON CONFLICT (name) DO NOTHING',
                [station.name, station.code, station.line]
            );
        }

        // Create admin user
        const adminHash = bcrypt.hashSync('admin123', 10);
        await client.query(
            'INSERT INTO users (username, password_hash, full_name, role, station_id) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (username) DO NOTHING',
            ['admin', adminHash, 'System Administrator', 'admin', null]
        );

        // Create sample staff users for first 3 stations
        const staffHash = bcrypt.hashSync('staff123', 10);
        const stationRows = await client.query('SELECT id, name FROM stations ORDER BY id LIMIT 3');

        for (const station of stationRows.rows) {
            const username = station.name.toLowerCase().replace(/\s+/g, '_');
            await client.query(
                `INSERT INTO users (username, password_hash, full_name, role, station_id) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (username) DO NOTHING`,
                [`staff_${username}`, staffHash, `Staff - ${station.name}`, 'staff', station.id]
            );
        }

        // Insert sample machinery for each station
        const allStations = await client.query('SELECT id FROM stations');
        const machines = ['Floor Scrubber', 'Vacuum Cleaner', 'Pressure Washer', 'Sweeping Machine'];

        for (const station of allStations.rows) {
            for (const machine of machines) {
                const existing = await client.query(
                    'SELECT id FROM machinery WHERE station_id = $1 AND machine_name = $2',
                    [station.id, machine]
                );

                if (existing.rows.length === 0) {
                    await client.query(
                        'INSERT INTO machinery (station_id, machine_name, status) VALUES ($1, $2, $3)',
                        [station.id, machine, 'free']
                    );
                }
            }
        }

        await client.query('COMMIT');
        console.log('✅ Database seeded successfully!');
        console.log('📍 10 metro stations created');
        console.log('👤 Admin user: admin / admin123');
        console.log('👷 Staff users: staff_rajiv_chowk / staff123, staff_kashmere_gate / staff123, staff_huda_city_centre / staff123');
        console.log('🔧 4 machines per station');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('❌ Seed error:', error);
    } finally {
        client.release();
        // Close the pool so the script can exit
        await db.end();
    }
}

seedData();
