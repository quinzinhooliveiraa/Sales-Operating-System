const fs = require('fs');
let content = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');
// Fix missing ending tag or extra curly brace
// The error is `The character "}" is not valid inside a JSX element` at line 677.
// Looking at the read output:
// 677→                  )}
// 678→                </div>
// 679→              ))}
// 680→            </div>
// 681→            </div>

const badCode = `                    </div>
                  )}
                </div>
              ))}
            </div>
            </div>`;
const goodCode = `                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>`;

content = content.replace(badCode, goodCode);
fs.writeFileSync('client/src/pages/CRMView.tsx', content);
