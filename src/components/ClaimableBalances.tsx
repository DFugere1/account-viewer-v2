import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  Heading2,
  Button,
  Identicon,
  Layout,
  TextLink,
  Icon,
  Table,
  Modal,
} from "@stellar/design-system";
import { NATIVE_ASSET_CODE } from "constants/settings";
import { fetchClaimableBalancesAction } from "ducks/claimableBalances";
import { getNetworkConfig } from "helpers/getNetworkConfig";
import { formatAmount } from "helpers/formatAmount";
import { useRedux } from "hooks/useRedux";
import { AssetType } from "types/types.d";
import { Asset } from "stellar-sdk";
import { SendTransactionFlow } from "components/SendTransaction/SendClaimClaimableBalanceFlow";

export const ClaimableBalances = () => {
  const { account, claimableBalances, settings } = useRedux(
    "account",
    "claimableBalances",
    "settings",
  );
  const [IsClaimTxModalVisible, setIsClaimTxModalVisible] = useState(false);
  const [balanceId, setbalanceId] = useState<string>("");
  const [balanceAsset, setBalanceAsset] = useState<Asset>(Asset.native());

  const handleShow = ( ) => {
    setIsClaimTxModalVisible(true);
    };

  const resetModalStates = () => {
    setIsClaimTxModalVisible(false);
    setbalanceId("");
    setBalanceAsset(Asset.native());
  };
  const accountId = account.data?.id;
  const dispatch = useDispatch();

  useEffect(() => {
    if (accountId) {
      dispatch(fetchClaimableBalancesAction(accountId));
    }
  }, [accountId, dispatch]);

  if (!claimableBalances?.data.length) {
    return null;
  }

  const getAssetLink = (asset: { code: string; issuer: string }) => {
    let assetString;

    if (asset.code === AssetType.NATIVE) {
      assetString = NATIVE_ASSET_CODE;
    } else {
      assetString = `${asset.code}-${asset.issuer}`;
    }

    return `${
      getNetworkConfig(settings.isTestnet).stellarExpertAssetUrl
    }${assetString}`;
  };

  return (
    <div className="ClaimableBalances DataSection">
      <Layout.Inset>
        <Heading2>Claimable Balances</Heading2>

        <Table
          columnLabels={[
            { id: "cb-asset", label: "Asset" },
            { id: "cb-amount", label: "Amount" },
            {id: "cb-claim", label: "Claim"},
            { id: "cb-sponsor", label: "Sponsor" },
          ]}
          data={claimableBalances.data}
          renderItemRow={(cb) => (
            <>
              <td>
                <TextLink
                  href={getAssetLink(cb.asset)}
                  variant={TextLink.variant.secondary}
                  underline
                >
                  {cb.asset.code === AssetType.NATIVE
                    ? NATIVE_ASSET_CODE
                    : cb.asset.code}
                </TextLink>
              </td>
              <td>{formatAmount(cb.amount)}</td>
              <td>
                <div className="ClaimBalance__buttons">
                  <Button
                    onClick={() => {
                      if (cb.asset.code === AssetType.NATIVE)  {
                        setBalanceAsset(Asset.native());

                      } else {
                        setBalanceAsset(
                           new Asset(cb.asset.code, cb.asset.issuer)); 
                      }
                      setbalanceId(cb.id);
                      handleShow();
                    }}
                    iconLeft={<Icon.Send />}
                  >
                  Claim balance
                </Button>
                </div>
              </td>
              <td className="Table__cell--align--right">
                <Identicon publicAddress={cb.sponsor} shortenAddress />
              </td>
            </>
          )}
          hideNumberColumn
        />
        <Modal
        visible={IsClaimTxModalVisible}
        onClose={resetModalStates}
      >
        {IsClaimTxModalVisible && (
          <SendTransactionFlow
            onCancel={() => {
              setIsClaimTxModalVisible(true);
              resetModalStates();
            }}
            balanceId={balanceId}
            balanceAsset = {balanceAsset}
          />
        )}
      </Modal>
      </Layout.Inset>
    </div>
  );
};
