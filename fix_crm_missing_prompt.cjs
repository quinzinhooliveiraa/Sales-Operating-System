const fs = require('fs');

let crm = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');

// I checked if moveLeadPromptTitle is in CRMView.tsx and it isn't.
// It seems the script implement_cadence_drag_drop.cjs did not properly insert the dialog.
// Let's insert it right after the main return but before the Add Lead Dialog

const moveDialog = `
      <Dialog open={movePrompt.isOpen} onOpenChange={(open) => !open && setMovePrompt({isOpen: false, leadId: null, targetStageId: null})}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t?.moveLeadPromptTitle || "Reiniciar Lembretes?"}</DialogTitle>
            <DialogDescription>
              {t?.moveLeadPromptDesc || "Você moveu este lead. Deseja gerar novas tarefas de cadência para esta etapa ou manter as antigas?"}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => {
              if (movePrompt.leadId && movePrompt.targetStageId) {
                updateLeadStage(movePrompt.leadId, movePrompt.targetStageId, false);
                setMovePrompt({isOpen: false, leadId: null, targetStageId: null});
              }
            }}>
              {t?.keepCadence || "Manter Antigas"}
            </Button>
            <Button onClick={() => {
              if (movePrompt.leadId && movePrompt.targetStageId) {
                updateLeadStage(movePrompt.leadId, movePrompt.targetStageId, true);
                setMovePrompt({isOpen: false, leadId: null, targetStageId: null});
              }
            }}>
              {t?.restartCadence || "Gerar Novas Tarefas"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
`;

if (!crm.includes('moveLeadPromptTitle')) {
  // Let's inject it right after:
  // <div className="h-[calc(100vh-6rem)] flex flex-col space-y-4">
  crm = crm.replace(
    `<div className="h-[calc(100vh-6rem)] flex flex-col space-y-4">`,
    `<div className="h-[calc(100vh-6rem)] flex flex-col space-y-4">\n${moveDialog}`
  );
  
  fs.writeFileSync('client/src/pages/CRMView.tsx', crm);
  console.log("Injected missing drag drop dialog");
} else {
  console.log("Dialog already exists");
}
