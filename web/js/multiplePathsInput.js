import { app } from "/scripts/app.js";

app.registerExtension({
    name: "Comfyui_Qwen3-VL-Instruct.MultiplePathsInput",
    async beforeRegisterNodeDef(nodeType, nodeData, app) {
        if (!nodeData?.category?.startsWith("Comfyui_Qwen3-VL-Instruct")) {
            return;
        }
        switch (nodeData.name) {
            case "MultiplePathsInput":
                nodeType.prototype.onNodeCreated = function () {
                    this._type = "STRING";
                    this.inputs.find((input) => input.name === "path_1").label = "path(string)";
                    this.addWidget("button", "Update inputs", null, () => {
                        if (!this.inputs) {
                            this.inputs = [];
                        }
                        const target_number_of_inputs = this.widgets.find(
                            (w) => w.name === "inputcount"
                        )["value"];
                        for (let i = this.inputs.length - 1; i >= 0; i--) {
                            const pathIndex = /^path_(\d+)$/.exec(this.inputs[i].name);
                            if (pathIndex && Number(pathIndex[1]) > target_number_of_inputs) {
                                this.removeInput(i);
                            }
                        }
                        for (let i = 1; i <= target_number_of_inputs; i++) {
                            if (!this.inputs.some((input) => input.name === `path_${i}`)) {
                                this.addInput(`path_${i}`, this._type);
                            }
                        }
                    });
                };
                break;
        }
    },
    async setup() {
        const originalComputeVisibleNodes =
            LGraphCanvas.prototype.computeVisibleNodes;
        LGraphCanvas.prototype.computeVisibleNodes = function () {
            const visibleNodesSet = new Set(
                originalComputeVisibleNodes.apply(this, arguments)
            );
            for (const node of this.graph._nodes) {
                if (
                    (node.type === "SetNode" || node.type === "GetNode") &&
                    node.drawConnection
                ) {
                    visibleNodesSet.add(node);
                }
            }
            return Array.from(visibleNodesSet);
        };
    },
});
