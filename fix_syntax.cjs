const fs = require('fs');
let code = fs.readFileSync('client/src/pages/CRMView.tsx', 'utf8');

const searchCode = `                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          </div>
          <div className="p-4 sm:p-6 border-t bg-card flex justify-end gap-3 shrink-0">`;
const replaceCode = `                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 sm:p-6 border-t bg-card flex justify-end gap-3 shrink-0">`;

code = code.replace(searchCode, replaceCode);
fs.writeFileSync('client/src/pages/CRMView.tsx', code);
