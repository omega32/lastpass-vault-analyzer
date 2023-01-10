interface LastPassXMLVault {
    response: {
        accounts: {
            account: Array<*>
        },
        neveraccounts: {
            neverautologin: Array<*>,
            neveraccount: Array<*>,
            nevergenerate: Array<*>,
            nevershowicons: Array<*>,
            neverformfill: Array<*>
        },
        formfills: {
            formfill: Array<*>
        },
        appaccts: null,
        equivdomains: {
            equivdomain: Array<*>
        },
        urlrules: {
            urlrule: Array<*>
        },
        identities: null,
        pendingshares: null,
        secprompts: {},
        secshareeautopushes: null
    }
}
