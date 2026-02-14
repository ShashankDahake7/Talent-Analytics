import Employee from '../models/Employee.js';
import WorkforceSnapshot from '../models/WorkforceSnapshot.js';

export const generateAttritionForecast = async (departmentId) => {
    const match = departmentId ? { departmentId } : {};
    const snapshots = await WorkforceSnapshot.find(match)
        .sort({ date: 1 })
        .limit(24);
    const employeeMatch = { status: 'active', ...match };
    const employees = await Employee.find(employeeMatch, {
        attritionRiskScore: 1,
        attritionRiskBand: 1,
        highPotentialFlag: 1,
    });
    let totalExpectedExitsNextYear = 0;
    for (const emp of employees) {
        if (emp.highPotentialFlag) {
            continue;
        }
        let probability = 0;
        if (typeof emp.attritionRiskScore === 'number') {
            probability = emp.attritionRiskScore;
        } else if (emp.attritionRiskBand) {
            switch (emp.attritionRiskBand) {
                case 'high':
                    probability = 0.7;
                    break;
                case 'medium':
                    probability = 0.3;
                    break;
                case 'low':
                    probability = 0.05;
                    break;
                default:
                    probability = 0.1;
            }
        } else {
            probability = 0.1;
        }
        totalExpectedExitsNextYear += probability;
    }
    const monthlyExpectedExits = totalExpectedExitsNextYear / 12;
    const currentHeadcount = employees.length;
    const horizon = 6;
    const forecast = [];
    let projectedHeadcount = currentHeadcount;
    for (let i = 1; i <= horizon; i += 1) {
        projectedHeadcount -= monthlyExpectedExits;
        forecast.push({
            period: i,
            expectedExits: parseFloat(monthlyExpectedExits.toFixed(2)),
            projectedHeadcount: Math.max(0, Math.round(projectedHeadcount * 10) / 10),
        });
    }
    return {
        history: snapshots,
        forecast,
        meta: {
            activeCount: currentHeadcount,
            annualizedExpectedExits: parseFloat(totalExpectedExitsNextYear.toFixed(1)),
        },
    };
};
