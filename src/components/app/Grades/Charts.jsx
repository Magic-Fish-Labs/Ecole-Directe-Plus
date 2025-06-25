import { useState, useEffect, useRef, useContext } from "react";
// import { Chart } from 'chart.js';
import { applyZoom, getZoomedBoudingClientRect } from "../../../utils/zoom";

import "./Charts.css";
import DropDownMenu from "../../generic/UserInputs/DropDownMenu";

import { AppContext } from "../../../App";

export default function Charts({ selectedPeriod }) {
    /**
     * Charts types:
     * 0: General average + streak history | line
     * 1: Subjects average | bar
     * 2: Subjects average | radar
     */

    // States 

    const { useUserSettings } = useContext(AppContext);

    const settings = useUserSettings()
    const [selectedChart, setSelectedChart] = useState(settings.get("selectedChart"));

    const chartContainerRef = useRef(null);
    const canvasContainerRef = useRef(null);
    const chart = useRef(null);
    const chartOptions = useRef(null);
    const chartData = useRef(null);

    const { activeAccount, useUserData, usedDisplayTheme } = useContext(AppContext);
    const userData = useUserData();

    const generalAverageHistory = userData.get("generalAverageHistory");
    const classGeneralAverageHistory = userData.get("classGeneralAverageHistory");
    const streakScoreHistory = userData.get("streakScoreHistory");
    const subjectsComparativeInformation = userData.get("subjectsComparativeInformation");

    const resizeChart = () => {
        chartContainerRef.current.height = getZoomedBoudingClientRect(document.getElementById("charts")?.getBoundingClientRect()).height - getZoomedBoudingClientRect(document.querySelector("#charts > .top-container")?.getBoundingClientRect()).height;
    }

    useEffect(() => {
        window.addEventListener("resize", resizeChart);
        resizeChart();

        return () => {
            window.removeEventListener("resize", resizeChart);
        }
    }, [])

    function getChartData() {
        /**
         * return the appropriate dataset according to the selectedChart
         */
        const userData = useUserData();
        const minMaxEnabled = userData.get("gradesEnabledFeatures")?.moyenneMin && userData.get("gradesEnabledFeatures")?.moyenneMax;


        switch (selectedChart) {
            case 0:
                // General average + streak history | line
                chartOptions.current = {
                    scales: {
                        y: {
                            // beginAtZero: true,
                            type: 'linear',
                            display: true,
                            position: 'left',
                            suggestedMax: 20
                        },
                        // y1: {
                        //   type: 'linear',
                        //   display: true,
                        //   position: 'right',
                        //   suggestedMax: 20
                        // }
                        // xAxes: [{
                        //   type: 'time',
                        //   ticks: {
                        //     autoSkip: true,
                        //     maxTicksLimit: 20
                        //   }
                        // }]
                    },
                    interaction: {
                        mode: "index",
                        intersect: false,
                    },
                };
                chartData.current = {
                    labels: Array.from({ length: generalAverageHistory[selectedPeriod].dates.length }, (_, i) => generalAverageHistory[selectedPeriod].dates[i].toLocaleDateString("fr-FR", { year: 'numeric', month: 'long', day: 'numeric' })),
                    datasets: [
                        {
                            type: "line",
                            label: "Moyenne générale",
                            data: generalAverageHistory[selectedPeriod].generalAverages,
                            borderColor: 'rgb(53, 162, 235)',
                            backgroundColor: 'rgba(53, 162, 235, 0.5)',
                            tension: 0.2,
                            // yAxisID: "y"
                        },
                        {
                            type: "line",
                            label: "Moyenne générale de classe",
                            data: classGeneralAverageHistory[selectedPeriod].classGeneralAverages,
                            borderColor: 'rgb(53, 180, 162)',
                            backgroundColor: 'rgba(53, 180, 162, 0.5)',
                            tension: 0.2,
                            // yAxisID: "y"
                        },
                        {
                            type: "line",
                            label: "Score de Streak",
                            data: streakScoreHistory[selectedPeriod],
                            borderColor: 'rgb(255, 99, 132)',
                            backgroundColor: 'rgba(255, 99, 132, 0.5)',
                            tension: 0.2,
                            // yAxisID: "y1"
                        },
                    ],
                };
                break;

            case 1:
                // Subjects average | bar
                chartOptions.current = {
                    scales: {
                        y: {
                            type: 'linear',
                            beginAtZero: true,
                            display: true,
                            position: 'left',
                            suggestedMax: 20
                        },
                    },
                    interaction: {
                        mode: "index",
                        intersect: false,
                    },
                };
                chartData.current = {
                    labels: Array.from({ length: subjectsComparativeInformation[selectedPeriod].length }, (_, i) => subjectsComparativeInformation[selectedPeriod][i].subjectFullname),
                    datasets: [
                    ...(minMaxEnabled ? [
                        {
                            type: "bar",
                            label: "Moyennes min et max de classe",
                            data: subjectsComparativeInformation[selectedPeriod].map((subject) => [subject.minAverage, subject.maxAverage]),
                            borderWidth: 2,
                            borderRadius: 7,
                            borderColor: 'rgb(53, 162, 235)',
                            backgroundColor: 'rgba(53, 162, 235, 0.5)',
                            // yAxisID: "y"
                            borderSkipped: false,
                            order: 2
                            },
                        ] : []
                        ),
                        {
                            type: "line",
                            label: "Moyenne élève",
                            data: subjectsComparativeInformation[selectedPeriod].map((subject) => subject.average),
                            borderColor: 'rgb(255, 99, 132)',
                            backgroundColor: 'rgba(255, 99, 132, 0.5)',
                            tension: 0.2,
                            // yAxisID: "y1"
                            order: 0,
                        },
                        {
                            type: "line",
                            label: "Moyenne classe",
                            data: subjectsComparativeInformation[selectedPeriod].map((subject) => subject.classAverage),
                            borderColor: 'rgb(24, 24, 41)',
                            backgroundColor: 'rgba(24, 24, 41, 0.5)',
                            tension: 0.2,
                            // yAxisID: "y1"
                            order: 1,
                        },
                        // {
                        //   type: "line",
                        //   label: "Moyennes max classe",
                        //   data: subjectsComparativeInformation[selectedPeriod].map((subject) => subject.maxAverage),
                        //   borderColor: 'rgb(53, 162, 235)',
                        //   backgroundColor: 'rgba(53, 162, 235, 0.5)',
                        //   tension: 0.2,
                        //   // yAxisID: "y1"
                        //   order: 2,
                        // },
                        // {
                        //   type: "line",
                        //   label: "Moyennes min classe",
                        //   data: subjectsComparativeInformation[selectedPeriod].map((subject) => subject.minAverage),
                        //   borderColor: 'rgb(53, 162, 235)',
                        //   backgroundColor: 'rgba(53, 162, 235, 0.5)',
                        //   tension: 0.2,
                        //   // yAxisID: "y1"
                        //   order: 3,
                        // },
                    ],
                };
                break;

            case 2:
                // Subjects average | radar
                chartOptions.current = {
                    scales: {
                        r: {
                            ticks: {
                                showLabelBackdrop: false,
                                z: 1
                            },
                            beginAtZero: true,
                            suggestedMax: 20,
                            grid: {
                                color: usedDisplayTheme == "dark" ? "rgba(180, 180, 240, .4)" : "rgba(76, 76,  184, .4)"
                            }
                        }
                    },
                    interaction: {
                        axis: "xy",
                        mode: "index",
                        intersect: false,
                    },
                };
                chartData.current = {
                    labels: Array.from({ length: subjectsComparativeInformation[selectedPeriod].length }, (_, i) => subjectsComparativeInformation[selectedPeriod][i].subjectFullname),
                    datasets: [
                        {
                            type: "radar",
                            label: "Moyenne élève",
                            data: subjectsComparativeInformation[selectedPeriod].map((subject) => subject.average),
                            borderColor: 'rgb(255, 99, 132)',
                            backgroundColor: 'rgba(255, 99, 132, 0.2)',
                            order: 0,
                        },
                        {
                            type: "radar",
                            label: "Moyenne classe",
                            data: subjectsComparativeInformation[selectedPeriod].map((subject) => subject.classAverage),
                            borderColor: 'rgb(24, 24, 41)',
                            backgroundColor: 'rgba(24, 24, 41, 0.2)',
                            order: 1,
                        },
                    ],
                };
                break;

            default:
                break;
        }
    }

    function registerPlugin() {
        Chart.register({
            id: "zoomCSS", // allow the chart interactions to take into account the CSS zoom
            beforeEvent(chart, ctx) {
                const event = ctx.event;
                event.x = applyZoom(event.x);
                event.y = applyZoom(event.y);
            }
        });
    }

    const buildChart = () => {
        console.log("Building chart...");
        getChartData();
        const ctx = chartContainerRef.current.getContext("2d");
        Chart.defaults.color = usedDisplayTheme == "dark" ? "rgb(180, 180, 240)" : "rgb(76, 76, 184)";
        registerPlugin();
        chart.current = new Chart(ctx, {
            data: chartData.current,
            options: {
                animation: {
                    duration: 0, // general animation time
                },
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "top",
                    },
                    tooltip: {
                        backgroundColor: usedDisplayTheme == "dark" ? "rgba(24, 24, 41, .8)" : "rgba(228, 228, 255, .8)",
                        cornerRadius: 10,
                        padding: 10,
                        boxPadding: 4,
                        bodySpacing: 6,
                        titleColor: usedDisplayTheme == "dark" ? "white" : "black",
                        bodyColor: usedDisplayTheme == "dark" ? "white" : "black",
                        footerColor: usedDisplayTheme == "dark" ? "white" : "black"
                    },
                    zoomCSS: true
                },
                ...chartOptions.current
            }
        });

        return chart;
    }

    function refreshChart() {
        if (chart.current) {
            chart.current.destroy();
            buildChart();
        }
    }

    useEffect(() => {
        refreshChart();
        useUserSettings("selectedChart").set(selectedChart);
    }, [selectedChart, activeAccount, selectedPeriod]);

    useEffect(() => {
        const script = document.createElement("script");

        script.src = "https://cdn.jsdelivr.net/npm/chart.js";
        script.async = true;
        script.onload = buildChart;

        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        }
    }, []);

    // JSX
    return (
        <div id="charts">
            <div className="top-container">
                <DropDownMenu
                    name="chart-type"
                    options={[0, 1, 2]}
                    displayedOptions={["Moyenne générale Courbe", "Moyennes par matière Barres", "Moyennes par matière Radar"]}
                    selected={selectedChart}
                    onChange={(value) => {
                        setSelectedChart(parseInt(value));
                    }}
                />
                <h3>Graphiques</h3>
                <div className="artificial-horizontal-center"></div>
            </div>
            <div id="canvas-container" ref={canvasContainerRef}>
                <canvas id="chart-container" ref={chartContainerRef}></canvas>
            </div>
        </div>
    )
}
