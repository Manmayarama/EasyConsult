import React, { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import axios from "axios";
import { DoctorContext } from '../../context/DoctorContext'

const DoctorStats = ({ docId }) => {
    const [data, setData] = useState([]);
    const {backendUrl}=useContext(DoctorContext)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axios.post(backendUrl+'/api/doctor/get-stats', { docId });
                if (res.data.success) {
                    setData(res.data.stats.map(item => ({
                        date: item._id,
                        count: item.count
                    })));
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchStats();
    }, [docId]);

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#8884d8" />
            </LineChart>
        </ResponsiveContainer>
    );
};

export default DoctorStats;
