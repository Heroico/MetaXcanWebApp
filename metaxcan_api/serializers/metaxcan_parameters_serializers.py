__author__ = 'heroico'


from rest_framework import serializers
from metaxcan_api.models import MetaxcanParameters, TranscriptomeModelDB, Covariance

class MetaxcanParametersSerializer(serializers.HyperlinkedModelSerializer):
    # TODO: implement user view
    owner = serializers.HyperlinkedRelatedField(view_name='user-detail', read_only=True)
    transcriptome = serializers.PrimaryKeyRelatedField(queryset=TranscriptomeModelDB.objects.all(), required=False)
    covariance = serializers.PrimaryKeyRelatedField(queryset=Covariance.objects.all(), required=False)

    class Meta:
        model = MetaxcanParameters
        fields = ('owner', 'transcriptome', 'covariance', 'snp_column',
                  'other_allele_column', 'effect_allele_column',
                  'beta_column', 'beta_sign_column', 'odd_ratio_column',
                  'p_column', 'compressed', 'separator')
