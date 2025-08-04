import React, { useEffect, useState } from 'react';
import { FaBed, FaCheckCircle, FaTimesCircle, FaChevronDown, FaChevronRight, FaBuilding, FaLayerGroup } from 'react-icons/fa';

// Utility: get color for occupancy percent (red, orange, green)
function getOccupancyColor(percent) {
  if (percent < 40) return '#ef4444'; // red-500
  if (percent < 70) return '#f59e42'; // orange-400
  return '#16a34a'; // green-600
}

const OccupancyVacancyStats = () => {
  const API_URL = import.meta.env.VITE_API_URL || '';
  const [stats, setStats] = useState({ totalUnits: 0, occupiedUnits: 0, vacantUnits: 0 });
  const [propertyStats, setPropertyStats] = useState([]); // [{ name, total, occupied, vacant, percent, unitTypeBreakdown, isMixed }]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState({}); // { [propertyName]: boolean }

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        // Fetch overall stats
        const res = await fetch(`${API_URL}/api/occupancy`, {
          headers: { Authorization: token ? `Bearer ${token}` : '' },
        });
        if (!res.ok) throw new Error('Failed to fetch occupancy stats');
        const data = await res.json();
        if (data && data.data && typeof data.data.totalUnits === 'number') {
          setStats(data.data);
        } else {
          setStats({ totalUnits: 0, occupiedUnits: 0, vacantUnits: 0 });
        }
        // Fetch all properties for per-property and unit type breakdown
        const propRes = await fetch(`${API_URL}/api/properties`, {
          headers: { Authorization: token ? `Bearer ${token}` : '' },
        });
        const propData = await propRes.json();
        let propertyArray = Array.isArray(propData) ? propData : propData.properties || propData || [];
        // Calculate stats per property, and unit type breakdown per property
        const perProperty = propertyArray.map((p) => {
          let total = 0, occupied = 0, vacant = 0;
          const unitTypeMap = {};
          (p.units || []).forEach(floorObj => {
            (floorObj.units || []).forEach(unit => {
              total++;
              if (unit.status === 'occupied') occupied++;
              else vacant++;
              const type = unit.type || 'Unknown';
              if (!unitTypeMap[type]) unitTypeMap[type] = { type, total: 0, occupied: 0, vacant: 0 };
              unitTypeMap[type].total++;
              if (unit.status === 'occupied') unitTypeMap[type].occupied++;
              else unitTypeMap[type].vacant++;
            });
          });
          const unitTypeBreakdown = Object.values(unitTypeMap).map(u => ({
            ...u,
            percent: u.total ? Math.round((u.occupied / u.total) * 100) : 0,
          }));
          const isMixed = unitTypeBreakdown.length > 1;
          return {
            name: p.name,
            total,
            occupied,
            vacant,
            percent: total ? Math.round((occupied / total) * 100) : 0,
            unitTypeBreakdown,
            isMixed,
          };
        });
        setPropertyStats(perProperty);
      } catch (err) {
        setError(err.message || 'Failed to fetch occupancy stats');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [API_URL]);

  const { totalUnits, occupiedUnits, vacantUnits } = stats;
  const occupiedPercent = totalUnits ? Math.round((occupiedUnits / totalUnits) * 100) : 0;
  const vacantPercent = totalUnits ? 100 - occupiedPercent : 0;
  const occupancyColor = getOccupancyColor(occupiedPercent);

  const toggleExpand = (propertyName) => {
    setExpanded((prev) => ({ ...prev, [propertyName]: !prev[propertyName] }));
  };

  if (loading) return <div className="w-full max-w-2xl mx-auto mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#03A6A1]/10 to-[#FFA673]/10 shadow text-center text-[#03A6A1] font-bold">Loading occupancy stats...</div>;
  if (error) return <div className="w-full max-w-2xl mx-auto mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#03A6A1]/10 to-[#FFA673]/10 shadow text-center text-red-600">{error}</div>;

  return (
    <div className="w-full max-w-2xl mx-auto mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#03A6A1]/10 to-[#FFA673]/10 shadow flex flex-col gap-8">
      {/* Donut chart and overall stats */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center justify-center w-full md:w-1/3">
          <svg width="120" height="120" viewBox="0 0 42 42" className="block">
            <circle
              cx="21" cy="21" r="15.915"
              fill="none"
              stroke="#E5E7EB"
              strokeWidth="4"
            />
            <circle
              cx="21" cy="21" r="15.915"
              fill="none"
              stroke={occupancyColor}
              strokeWidth="4"
              strokeDasharray={`${occupiedPercent} ${100 - occupiedPercent}`}
              strokeDashoffset="25"
              strokeLinecap="round"
            />
            <circle
              cx="21" cy="21" r="15.915"
              fill="none"
              stroke="#ef4444"
              strokeWidth="4"
              strokeDasharray={`${vacantPercent} ${100 - vacantPercent}`}
              strokeDashoffset={25 + occupiedPercent}
              strokeLinecap="round"
            />
            <text x="21" y="23" textAnchor="middle" fontSize="8" fill={occupancyColor} fontWeight="bold">
              {occupiedPercent}%
            </text>
          </svg>
          <div
            className="mt-2 px-4 py-1 rounded-full font-bold text-sm"
            style={{
              background: 'linear-gradient(90deg, #E6F7F7 60%, #FFA67322 100%)',
              color: '#03A6A1',
              border: '2px solid #03A6A1',
              display: 'inline-block',
              boxShadow: '0 1px 4px #03A6A122',
              letterSpacing: '0.5px',
            }}
          >
            Occupancy
          </div>
        </div>
        <div className="flex-1 flex flex-row items-center justify-around gap-2 md:gap-8 mt-6 md:mt-0">
          {/* Total Units */}
          <div className="flex flex-col items-center w-1/3">
            <span className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-[#03A6A1]/90 text-white text-2xl md:text-3xl font-extrabold shadow border-4 border-[#E6F7F7]">
              {totalUnits}
            </span>
            <span className="mt-1 md:mt-2 px-2 md:px-3 py-1 rounded-lg font-semibold text-xs md:text-xs bg-[#E6F7F7] text-[#03A6A1] border border-[#03A6A1]/20 shadow-sm flex items-center gap-1 w-full justify-center">
              <FaBed className="text-[#03A6A1]" />Total Units
            </span>
          </div>
          {/* Occupied */}
          <div className="flex flex-col items-center w-1/3">
            <span className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-green-600 text-white text-2xl md:text-3xl font-extrabold shadow border-4 border-green-100">
              {occupiedUnits}
            </span>
            <span className="mt-1 md:mt-2 px-2 md:px-3 py-1 rounded-lg font-semibold text-xs md:text-xs bg-green-50 text-green-700 border border-green-200 shadow-sm flex items-center gap-1 w-full justify-center">
              <FaCheckCircle className="text-green-600" />Occupied
            </span>
          </div>
          {/* Vacant */}
          <div className="flex flex-col items-center w-1/3">
            <span className="flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full bg-red-600 text-white text-2xl md:text-3xl font-extrabold shadow border-4 border-red-200">
              {vacantUnits}
            </span>
            <span className="mt-1 md:mt-2 px-2 md:px-3 py-1 rounded-lg font-semibold text-xs md:text-xs bg-red-50 text-red-600 border border-red-200 shadow-sm flex items-center gap-1 w-full justify-center">
              <FaTimesCircle className="text-red-600" />Vacant
            </span>
          </div>
        </div>
      </div>
      {/* Per-property breakdown - Desktop Table */}
      <div className="overflow-x-auto hidden md:block mb-8">
        <table className="min-w-full bg-white rounded-xl shadow-lg border border-[#FFA673]/30">
          <thead>
            <tr className="bg-[#03A6A1] text-white shadow-md">
              <th className="px-4 py-3 text-left rounded-tl-xl font-bold text-base border-l-4 border-[#FFA673]"><span className="flex items-center gap-1"><FaBuilding className="text-xs md:text-base" />Property</span></th>
              <th className="px-4 py-3 text-left font-bold text-base"><span className="flex items-center gap-1"><FaLayerGroup className="text-xs md:text-base" />Total</span></th>
              <th className="px-4 py-3 text-left font-bold text-base"><span className="flex items-center gap-1"><FaCheckCircle className="text-xs md:text-base" />Occupied</span></th>
              <th className="px-4 py-3 text-left font-bold text-base"><span className="flex items-center gap-1"><FaTimesCircle className="text-xs md:text-base" />Vacant</span></th>
              <th className="px-4 py-3 text-left rounded-tr-xl font-bold text-base"><span className="flex items-center gap-1"><FaBed className="text-xs md:text-base" />Occupancy</span></th>
            </tr>
          </thead>
          <tbody>
            {propertyStats.map((p, idx) => {
              const color = getOccupancyColor(p.percent);
              return (
              <React.Fragment key={p.name || idx}>
                <tr className={
                  `border-b border-[#FFA673]/10 hover:bg-[#FFF8F0] transition-colors duration-150 ${idx % 2 === 0 ? 'bg-[#F4F8FB]' : 'bg-white'}`
                }>
                  <td className="px-4 py-2 font-semibold text-[#03A6A1] flex items-center gap-2">
                    {p.isMixed && (
                      <button
                        className="mr-2 focus:outline-none rounded-full border border-[#03A6A1]/30 bg-[#E6F7F7] hover:bg-[#03A6A1]/10 p-1 transition"
                        onClick={() => toggleExpand(p.name)}
                        aria-label={expanded[p.name] ? 'Collapse' : 'Expand'}
                      >
                        {expanded[p.name] ? <FaChevronDown /> : <FaChevronRight />}
                      </button>
                    )}
                    {p.name}
                  </td>
                  <td className="px-4 py-2">
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-[#03A6A1]/90 text-white text-lg font-bold shadow border-2 border-[#E6F7F7] mx-auto">
                      {p.total}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-green-600 text-white text-lg font-bold shadow border-2 border-green-100 mx-auto">
                      {p.occupied}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-red-600 text-white text-lg font-bold shadow border-2 border-red-200 mx-auto">
                      {p.vacant}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded overflow-hidden">
                        <div
                          className="h-2 rounded-l"
                          style={{ width: `${p.percent}%`, background: color }}
                        />
                        <div
                          className="h-2 bg-red-600 rounded-r"
                          style={{ width: `${100 - p.percent}%`, marginLeft: `${p.percent}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold px-2 py-1 rounded-full shadow-sm border border-[#03A6A1]/10" style={{background: '#E6F7F7', color}}>{p.percent}%</span>
                    </div>
                  </td>
                </tr>
                {p.isMixed && expanded[p.name] && (
                  <tr className="bg-[#F9F9F9]">
                    <td colSpan={5} className="px-8 py-2 rounded-b-xl">
                      <div className="font-semibold text-[#03A6A1] mb-3 bg-[#F0F9F9] rounded-xl px-4 py-2 text-center shadow border border-[#03A6A1]/10 mx-auto w-fit" style={{fontWeight: 700, fontSize: '1.05em'}}>Unit Type Breakdown</div>
                      <table className="min-w-[400px] w-full bg-white rounded-xl shadow border border-[#FFA673]/10 mb-2">
                        <thead>
                          <tr className="bg-[#E6F7F7] text-[#03A6A1] shadow mt-4 border-l-4 border-[#03A6A1] rounded-t-xl" style={{fontSize: '0.95em', marginTop: '1rem'}}>
                            <th className="px-2 py-2 text-left rounded-tl-xl font-bold border-l-4 border-[#03A6A1]"><span className="flex items-center gap-1"><FaLayerGroup className="text-xs md:text-base text-[#03A6A1]" />Unit Type</span></th>
                            <th className="px-2 py-2 text-left font-bold"><span className="flex items-center gap-1"><FaLayerGroup className="text-xs md:text-base text-[#03A6A1]" />Total</span></th>
                            <th className="px-2 py-2 text-left font-bold"><span className="flex items-center gap-1"><FaCheckCircle className="text-xs md:text-base text-green-600" />Occupied</span></th>
                            <th className="px-2 py-2 text-left font-bold"><span className="flex items-center gap-1"><FaTimesCircle className="text-xs md:text-base text-red-600" />Vacant</span></th>
                            <th className="px-2 py-2 text-left rounded-tr-xl font-bold"><span className="flex items-center gap-1"><FaBed className="text-xs md:text-base text-[#03A6A1]" />Occupancy</span></th>
                          </tr>
                        </thead>
                        <tbody>
                          {p.unitTypeBreakdown.map((u, uidx) => {
                            const uColor = getOccupancyColor(u.percent);
                            return (
                            <tr key={u.type || uidx} className={
                              `border-b border-[#FFA673]/10 ${uidx % 2 === 0 ? 'bg-[#FFF8F0]' : 'bg-white'}`
                            }>
                              <td className="px-2 py-1 font-semibold text-[#03A6A1]">{u.type}</td>
                              <td className="px-2 py-1">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#03A6A1]/90 text-white text-base font-bold shadow border-2 border-[#E6F7F7] mx-auto">
                                  {u.total}
                                </span>
                              </td>
                              <td className="px-2 py-1">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white text-base font-bold shadow border-2 border-green-100 mx-auto">
                                  {u.occupied}
                                </span>
                              </td>
                              <td className="px-2 py-1">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white text-base font-bold shadow border-2 border-red-200 mx-auto">
                                  {u.vacant}
                                </span>
                              </td>
                              <td className="px-2 py-1">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 h-2 bg-gray-200 rounded overflow-hidden">
                                    <div
                                      className="h-2 rounded-l"
                                      style={{ width: `${u.percent}%`, background: uColor }}
                                    />
                                    <div
                                      className="h-2 bg-red-600 rounded-r"
                                      style={{ width: `${100 - u.percent}%`, marginLeft: `${u.percent}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-bold px-2 py-1 rounded-full shadow-sm border border-[#03A6A1]/10" style={{background: '#E6F7F7', color: uColor}}>{u.percent}%</span>
                                </div>
                              </td>
                            </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
            })}
          </tbody>
        </table>
      </div>
      {/* Mobile: Cards (collapsible for mixed-unit) */}
      <div className="md:hidden flex flex-col gap-4 mb-8">
        {propertyStats.map((p, idx) => {
          const color = getOccupancyColor(p.percent);
          return (
          <div key={p.name || idx} className="bg-white rounded-xl shadow-lg p-4 flex flex-col gap-2 border border-[#FFA673]/30">
            <div className="flex items-center gap-2">
              {p.isMixed && (
                <button
                  className="focus:outline-none rounded-full border border-[#03A6A1]/30 bg-[#E6F7F7] hover:bg-[#03A6A1]/10 p-1 transition"
                  onClick={() => toggleExpand(p.name)}
                  aria-label={expanded[p.name] ? 'Collapse' : 'Expand'}
                >
                  {expanded[p.name] ? <FaChevronDown /> : <FaChevronRight />}
                </button>
              )}
              <div className="font-bold text-[#03A6A1] text-base flex items-center gap-1"><FaBuilding className="text-xs md:text-base text-[#03A6A1]" />{p.name}</div>
            </div>
            <div className="flex flex-col gap-2 text-xs mt-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#03A6A1]/90 text-white text-base font-bold shadow border-2 border-[#E6F7F7]">{p.total}</span>
                <span className="bg-[#E6F7F7] text-[#03A6A1] px-2 py-1 rounded font-semibold border border-[#03A6A1]/20">Total Units</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-green-600 text-white text-base font-bold shadow border-2 border-green-100">{p.occupied}</span>
                <span className="bg-green-50 text-green-700 px-2 py-1 rounded font-semibold border border-green-200">Occupied</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-600 text-white text-base font-bold shadow border-2 border-red-200">{p.vacant}</span>
                <span className="bg-red-50 text-red-600 px-2 py-1 rounded font-semibold border border-red-200">Vacant</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-2 bg-gray-200 rounded overflow-hidden">
                <div
                  className="h-2 rounded-l"
                  style={{ width: `${p.percent}%`, background: color }}
                />
                <div
                  className="h-2 bg-red-600 rounded-r"
                  style={{ width: `${100 - p.percent}%`, marginLeft: `${p.percent}%` }}
                />
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded-full shadow-sm border border-[#03A6A1]/10" style={{background: '#E6F7F7', color}}>{p.percent}%</span>
            </div>
            {p.isMixed && expanded[p.name] && (
              <div className="mt-2 pl-4 border-l-4 border-[#03A6A1]/30">
                <div className="font-semibold text-[#03A6A1] mb-3 bg-[#F0F9F9] rounded-xl px-4 py-2 text-center shadow border border-[#03A6A1]/10 mx-auto w-fit" style={{fontWeight: 700, fontSize: '1.05em'}}>Unit Type Breakdown</div>
                <div className="flex flex-col gap-2">
                  {/* Sort unit types alphabetically by name */}
                  {p.unitTypeBreakdown
                    .slice()
                    .sort((a, b) => (a.type || '').localeCompare(b.type || ''))
                    .map((u, uidx) => {
                      const uColor = getOccupancyColor(u.percent);
                      return (
                        <div key={u.type || uidx} className="flex flex-col gap-1 bg-[#FFF8F0] rounded-lg p-2 border border-[#FFA673]/10">
                          <div className="font-bold text-[#03A6A1] text-xs mb-1 flex items-center gap-1">
                            <FaLayerGroup className="text-xs md:text-base text-[#03A6A1]" />{u.type}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#03A6A1]/90 text-white text-sm font-bold shadow border-2 border-[#E6F7F7]">{u.total}</span>
                            <span className="bg-[#E6F7F7] text-[#03A6A1] px-2 py-1 rounded font-semibold border border-[#03A6A1]/20 flex items-center gap-1"><FaLayerGroup className="text-xs md:text-base text-[#03A6A1]" />Total</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-green-600 text-white text-sm font-bold shadow border-2 border-green-100">{u.occupied}</span>
                            <span className="bg-green-50 text-green-700 px-2 py-1 rounded font-semibold border border-green-200 flex items-center gap-1"><FaCheckCircle className="text-xs md:text-base text-green-600" />Occupied</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="flex items-center justify-center w-7 h-7 rounded-full bg-red-600 text-white text-sm font-bold shadow border-2 border-red-200">{u.vacant}</span>
                            <span className="bg-red-50 text-red-600 px-2 py-1 rounded font-semibold border border-red-200 flex items-center gap-1"><FaTimesCircle className="text-xs md:text-base text-red-600" />Vacant</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="bg-gray-200 px-2 py-1 rounded font-bold flex items-center gap-1" style={{color: uColor}}><FaBed className="text-xs md:text-base text-[#03A6A1]" />{u.percent}%</span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        );
        })}
      </div>
    </div>
  );
};

export default OccupancyVacancyStats;