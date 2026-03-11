const fs = require('fs');
let content = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');

const badCode = `                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          </div>
          <div className="p-4 sm:p-6 border-t bg-card flex justify-end gap-3 shrink-0">`;

const goodCode = `                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 sm:p-6 border-t bg-card flex justify-end gap-3 shrink-0">`;

content = content.replace(badCode, goodCode);
fs.writeFileSync('client/src/pages/CRMView.tsx', content);
